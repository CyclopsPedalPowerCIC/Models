#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <WebSocketsServer.h>
#include <ESP8266mDNS.h>

#define NREADERS 5
#define NTRIES 5   // how many failed reads in a row before we believe the card's gone away
#define ID 4

#define RST_PIN D4

struct reader {
  MFRC522 rfid;
  uint32_t serial;
  int tries;
  bool tested_ok;
} readers[NREADERS];

uint8_t pins[] = { D0, D1, D2, D3, D8 };
MFRC522::MIFARE_Key key; 

unsigned long lastelapsed;

ESP8266WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

void init_wifi() {
  uint8_t mac[6];
  WiFi.macAddress(mac);
  Serial.printf("MAC address: %02x:%02x:%02x:%02x:%02x:%02x\r\n", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  WiFi.mode(WIFI_STA);
  for (;;) {
    if (connect_wifi("cyclopswifi", "skullface")) return;
    if (connect_wifi("LeedsHackspace", "blinkyLED")) return;
  }
}

bool connect_wifi(const char* ssid, const char* password) {
  Serial.printf("Wifi: trying %s/%s", ssid,password);
  WiFi.begin(ssid, password);
  int tries = 30;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    if (!--tries) {
      Serial.print("failed\r\n");
      return false;
    }
  }
  Serial.printf("got IP ");
  Serial.println(WiFi.localIP());
  return true;
}

void init_server() {
  init_wifi();
  if (MDNS.begin(hostname_string())) {
    Serial.println("MDNS responder started");
  }

  server.on("/", handleRoot);
  server.on("/reboot", do_reboot);
  server.on("/reinit", do_reinit);

  //server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  Serial.println("WS server started");
}


void do_reboot() {
  server.send(200, "text/plain", "brb");
  ESP.reset();
}

void do_reinit() {
  init_readers();
  server.send(200, "text/plain", message_string());
}

void handleRoot() {
  server.send(200, "text/plain", message_string());
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.printf("[%u] Disconnected!\n", num);
            break;
        case WStype_CONNECTED:
            {
                IPAddress ip = webSocket.remoteIP(num);
                Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
                webSocket.sendTXT(num, message_string());
            }
            break;
         case WStype_TEXT:
             webSocket.broadcastTXT(message_string());
            break;
    }
}

const char *hostname_string() {
  static char buf[16];
  snprintf(buf, sizeof buf, "esprfid%d", ID);
  return buf;
}

void setup() { 
  Serial.begin(115200);
  Serial.print("\r\n\r\n\r\nmultirfidreader (" __TIME__ " " __DATE__ ")\r\n");
  init_server();
  init_readers();

  Serial.printf("Number of readers: %d\r\n", NREADERS);
  Serial.printf("Max retry count: %d\r\n", NTRIES);
  Serial.printf("ID: %d (hostname '%s.local')\r\n", ID, hostname_string());
  Serial.println("And we're go");
}

void init_readers () {
  Serial.println("Readers:");
  // pull shared reset pin low
  pinMode(RST_PIN, OUTPUT);
  digitalWrite(RST_PIN, LOW);
  delay(50);
  digitalWrite(RST_PIN, HIGH);  
  delay(10);

  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }

  SPI.begin(); // Init SPI bus
  for (int i=0; i<NREADERS; i++) {
    Serial.printf("%d: ",i);
    readers[i].rfid = MFRC522(pins[i], UINT8_MAX);
    readers[i].rfid.PCD_Init(); // Init MFRC522 
    bool tested_ok = readers[i].rfid.PCD_PerformSelfTest();
    Serial.println(tested_ok ? "OK" : "fail");
    if (tested_ok) 
      readers[i].rfid.PCD_Init(); // Init MFRC522 again after self-test

    readers[i].tested_ok = tested_ok;
    readers[i].serial = tested_ok ? 0 : 0xeeeeeeee;
    readers[i].tries = 0;
  }
}

bool cardpresent(MFRC522 r) {
        byte bufferATQA[2];
        byte bufferSize = sizeof(bufferATQA);

        // Reset baud rates
        r.PCD_WriteRegister(MFRC522::TxModeReg, 0x00);
        r.PCD_WriteRegister(MFRC522::RxModeReg, 0x00);
        // Reset ModWidthReg
        r.PCD_WriteRegister(MFRC522::ModWidthReg, 0x26);

        MFRC522::StatusCode result = r.PICC_WakeupA(bufferATQA, &bufferSize);
        return (result == MFRC522::STATUS_OK || result == MFRC522::STATUS_COLLISION);
}

uint32_t checkcard(struct reader &r) {
  MFRC522 rfid = r.rfid;

//  if ( ! rfid.PICC_IsNewCardPresent())
//    return;
  if (!cardpresent(rfid));// return 0;

  // Verify if the NUID has been readed
  if ( ! rfid.PICC_ReadCardSerial())
    return 0;

  // Halt PICC
  rfid.PICC_HaltA();

  // Stop encryption on PCD
  rfid.PCD_StopCrypto1();
  return (rfid.uid.uidByte[0]<<24) + (rfid.uid.uidByte[1]<<16) + (rfid.uid.uidByte[2]<<8) + rfid.uid.uidByte[3];
}

void poll_readers () {
  bool changed = false;
  for (int i=0; i<NREADERS; i++) {
    if (!readers[i].tested_ok) continue;
    uint32_t serial = checkcard(readers[i]);
    if (serial || ++readers[i].tries > NTRIES) {
      if (!serial && readers[i].serial) { Serial.print(i); Serial.print(" retry timeout\r\n"); }
      if (readers[i].serial != serial) changed = true;
      readers[i].serial = serial;
      readers[i].tries = 0;
    }
  }
  if (changed) {
      Serial.print("broadcasting\r\n");
    webSocket.broadcastTXT(message_string());
  }
}

char *message_string() {
  static char buf[256];
  char *end = buf+sizeof buf, *ptr=buf;
  *ptr++='[';
  for (int i=0; i<NREADERS; i++) {
    ptr+=snprintf(ptr, end-ptr, "\"%08x\",", readers[i].serial);
  }
  ptr--;
  *ptr++=']';
  *ptr++='\0';
  return buf;
}

void loop() {
  unsigned long t1, t2;
  t1 = millis();
  poll_readers();
  server.handleClient();
  webSocket.loop();
  t2 = millis();
  lastelapsed = t2-t1;
  Serial.printf("elapsed %d  \r", lastelapsed);
}
