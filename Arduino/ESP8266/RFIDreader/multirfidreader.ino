/*
 * --------------------------------------------------------------------------------------------------------------------
 * Example sketch/program showing how to read new NUID from a PICC to serial.
 * --------------------------------------------------------------------------------------------------------------------
 * This is a MFRC522 library example; for further details and other examples see: https://github.com/miguelbalboa/rfid
 * 
 * Example sketch/program showing how to the read data from a PICC (that is: a RFID Tag or Card) using a MFRC522 based RFID
 * Reader on the Arduino SPI interface.
 * 
 * When the Arduino and the MFRC522 module are connected (see the pin layout below), load this sketch into Arduino IDE
 * then verify/compile and upload it. To see the output: use Tools, Serial Monitor of the IDE (hit Ctrl+Shft+M). When
 * you present a PICC (that is: a RFID Tag or Card) at reading distance of the MFRC522 Reader/PCD, the serial output
 * will show the type, and the NUID if a new card has been detected. Note: you may see "Timeout in communication" messages
 * when removing the PICC from reading distance too early.
 * 
 * @license Released into the public domain.
 * 
 * Typical pin layout used:
 * -----------------------------------------------------------------------------------------
 *             MFRC522      Arduino       Arduino   Arduino    Arduino          Arduino
 *             Reader/PCD   Uno/101       Mega      Nano v3    Leonardo/Micro   Pro Micro     ESP8266
 * Signal      Pin          Pin           Pin       Pin        Pin              Pin
 * -----------------------------------------------------------------------------------------
 * RST/Reset   RST          9             5         D9         RESET/ICSP-5     RST           D2
 * SPI SS      SDA(SS)      10            53        D10        10               10            D1 purple
 * SPI MOSI    MOSI         11 / ICSP-4   51        D11        ICSP-4           16            D7
 * SPI MISO    MISO         12 / ICSP-1   50        D12        ICSP-1           14            D6
 * SPI SCK     SCK          13 / ICSP-3   52        D13        ICSP-3           15            D5
 */

#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <WebSocketsServer.h>
#include <ESP8266mDNS.h>

//#define SS_PIN D1
//#define SS_PIN_2 D3
#define RST_PIN UINT8_MAX //D2
#define NREADERS 5
#define RST_PIN D4

struct reader {
  MFRC522 rfid;
  uint32_t serial;
  int tries;
} readers[NREADERS];

#define NTRIES 5 // how many failed reads in a row before we believe the card's gone away

uint8_t pins[] = { D8, D3, D2, D1, D0 };
MFRC522::MIFARE_Key key; 

unsigned long lastelapsed;

ESP8266WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

void init_server() {
  const char* ssid = "LeedsHackspace";
  const char* password = "blinkyLED";

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("");

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  if (MDNS.begin("esprfid2")) {
    Serial.println("MDNS responder started");
  }

  server.on("/", handleRoot);
  
  //server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  Serial.println("WS server started");
}

void handleRoot() {
#if 0
String res;
  char buf[30];
  for (int i=0; i<NREADERS; i++) {
    snprintf(buf, sizeof buf, "%d: %08x\n", i, readers[i].serial);
    res += buf;
   }
  snprintf(buf, sizeof buf, "%d elapsed\n", lastelapsed);
  res += buf;
  server.send(200, "text/plain", res);
#else
  server.send(200, "text/plain", message_string());
#endif
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

void setup() { 
  Serial.begin(115200);
  Serial.println("A");
#if 1
  // pull shared reset pin low
  pinMode(RST_PIN, OUTPUT);
  digitalWrite(RST_PIN, LOW);
  delay(50);
  digitalWrite(RST_PIN, HIGH);  
  delay(10);
#endif
  init_server();
  init_readers ();
  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }
}

void init_readers () {
  int i;
  SPI.begin(); // Init SPI bus
  for (i=0; i<NREADERS; i++) {
    //set_latch_address(i);
    Serial.print(i);
    readers[i].rfid = MFRC522(pins[i], UINT8_MAX);
    readers[i].rfid.PCD_Init(); // Init MFRC522 
    Serial.println(readers[i].rfid.PCD_PerformSelfTest() ? "OK" : "fail");
    readers[i].rfid.PCD_Init(); // Init MFRC522 again after self-test
    readers[i].serial = 0;
    readers[i].tries = 0;
    Serial.print(":");
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

  //Serial.print(r.name);
  //Serial.print(F("PICC type: "));
  //MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
  //Serial.println(rfid.PICC_GetTypeName(piccType));
  
  // Halt PICC
  rfid.PICC_HaltA();

  // Stop encryption on PCD
  rfid.PCD_StopCrypto1();
  return (rfid.uid.uidByte[0]<<24) + (rfid.uid.uidByte[1]<<16) + (rfid.uid.uidByte[2]<<8) + rfid.uid.uidByte[3];
}

void poll_readers () {
  bool changed = false;
  for (int i=0; i<NREADERS; i++) {
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
  static char buf[16*NREADERS+16];
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
  Serial.print("elapsed ");
  lastelapsed = t2-t1;
  Serial.println(t2-t1);
}
