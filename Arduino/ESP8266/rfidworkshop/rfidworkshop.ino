#define FASTLED_ESP8266_RAW_PIN_ORDER  //needed to stop the fastLED library being too clever for its own good and assuming D2->GPOI19->D19
#define FASTLED_ALLOW_INTERRUPTS 0
#include "FastLED.h"
#include <SPI.h>
#include <MFRC522.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <WebSocketsServer.h>
#include <ESP8266mDNS.h>

#define NREADERS 1
#define NTRIES 5   // how many failed reads in a row before we believe the card's gone away
#define ID 1

struct reader {
  MFRC522 rfid;
  uint32_t serial;
  int tries;
  bool tested_ok;
} readers[NREADERS];

uint8_t pins[] = { D8 };
MFRC522::MIFARE_Key key; 

#define NUM_LEDS 20

#define PIN_LEDS      D3

const int switchpins[]= {D0, D1, D2};

#define NSWITCHES (sizeof(switchpins)/sizeof(switchpins[0]))

// Define the array of leds
CRGB leds[NUM_LEDS];

uint32_t switches = 0;

unsigned long lastelapsed;

ESP8266WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

void init_wifi() {
  uint8_t mac[6];
  WiFi.macAddress(mac);
  Serial.printf("MAC address: %02x:%02x:%02x:%02x:%02x:%02x\r\n", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  WiFi.mode(WIFI_STA);
  for (;;) {
    if (connect_wifi("Cyclops_Wifi", "skullface")) return;
    //if (connect_wifi("LeedsHackspace", "blinkyLED")) return;
  }
}

bool connect_wifi(const char* ssid, const char* password) {
  Serial.printf("Wifi: trying %s/%s", ssid,password);
  WiFi.begin(ssid, password);
  int tries = 80;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    if (!--tries) {
      Serial.print("\r\nfailed\r\n");
      return false;
    }
  }
  Serial.printf("\r\ngot IP ");
  Serial.println(WiFi.localIP());
  return true;
}

void init_server() {
  init_wifi();
#if 0
if (MDNS.begin("rfidworkshop")) {
    Serial.println("MDNS responder started");
  }
#endif

  server.on("/", handleRoot);
  server.on("/reboot", do_reboot);
  server.on("/reinit", do_reinit);
  server.on("/leds", handleBlock);
  
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

void handleBlock(){
  uint8_t q[3]={0,0,0};
  for (uint8_t i=0; i<server.args(); i++){
    if (server.argName(i)=="red"){
      q[0]=server.arg(i).toInt();
    }
    if (server.argName(i)=="green"){
      q[1]=server.arg(i).toInt();
    }
    if (server.argName(i)=="blue"){
      q[2]=server.arg(i).toInt();
    }
  }
  server.send(204, "text/plain", "");
  set_leds(q);
}


void handleRoot() {
     server.sendHeader("Location", "http://codecraft:8000/?"+server.hostHeader());
     server.send(301);
  //server.send(200, "text/plain", message_string());
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
    case WStype_BIN:
    case WStype_TEXT:
    Serial.printf("type %d len %d\r\n", type, length);
    if (length == 3) {
      set_leds(payload);
    }
    webSocket.sendTXT(num, message_string());
    break;
  }
}

void setup() { 
  Serial.begin(115200);
  Serial.print("\r\n\r\n\r\nrfidworkshop  (" __TIME__ " " __DATE__ ")\r\n");
  for (int i=0; i<sizeof(pins)/sizeof(pins[0]); i++) {
    pinMode(pins[i], OUTPUT);
    digitalWrite(pins[i], HIGH);
  }


  FastLED.addLeds<WS2812B, PIN_LEDS, GRB>(leds, NUM_LEDS);
  FastLED.show();
  fill_solid(&leds[0], NUM_LEDS, CRGB::Blue);
  FastLED.show();
  for (int i=0;i<NSWITCHES; i++) {
    pinMode(switchpins[i], INPUT_PULLUP);
    //digitalWrite(switchpins[i],0);
  }

  pinMode(PIN_LEDS, OUTPUT); 
    
  init_server();
  init_readers();

  Serial.printf("Number of readers: %d\r\n", NREADERS);
  Serial.printf("Max retry count: %d\r\n", NTRIES);
  Serial.println("And we're go");
  fill_solid(&leds[0], NUM_LEDS, CRGB::Black);
}

void init_readers () {
  Serial.println("Readers:");

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
  snprintf(ptr, end-ptr, "{\"rfid\":\"%08x\",\"sw\":%d}", readers[0].serial, switches);
  return buf;
}

void loop() {
  unsigned long t1, t2;
  t1 = millis();
  poll_readers();
  server.handleClient();
  poll_switches();
  //if (animating)
  //update_leds();
  webSocket.loop();
  if (WiFi.status() != WL_CONNECTED) {
    init_wifi();
  }
  t2 = millis();
  lastelapsed = t2-t1;
  Serial.printf("elapsed %d  \r", lastelapsed);
}

#define GAMMA_R 2.5
#define GAMMA_G 2.5
#define GAMMA_B 2.5

#define H(n) G(n),G(n+1),G(n+2),G(n+3),G(n+4),G(n+5),G(n+6),G(n+7),\
    G(n+8),G(n+9),G(n+10),G(n+11),G(n+12),G(n+13),G(n+14),G(n+15)

#define G(n) pow((n)/255.0,GAMMA_R)*255
const uint8_t gammatab_r[256] = {
    H(0),H(16),H(32),H(48),H(64),H(80),H(96),H(112),
    H(128),H(144),H(160),H(176),H(192),H(208),H(224),H(240)
},
#define G(n) pow((n)/255.0,GAMMA_G)*255
  gammatab_g[256] = {
    H(0),H(16),H(32),H(48),H(64),H(80),H(96),H(112),
    H(128),H(144),H(160),H(176),H(192),H(208),H(224),H(240)
},
#define G(n) pow((n)/255.0,GAMMA_B)*255
  gammatab_b[256] = {
    H(0),H(16),H(32),H(48),H(64),H(80),H(96),H(112),
    H(128),H(144),H(160),H(176),H(192),H(208),H(224),H(240)
  };
#undef G
#undef H
#undef GAMMA

CRGB gamma_apply(CRGB in) {
  return CRGB(gammatab_r[in.r],
	      gammatab_g[in.g],
	      gammatab_b[in.b]);
}

#define BUFCOL(offs) \
  CRGB(buf[(offs)],buf[(offs+1)],buf[(offs+2)])

void set_leds(uint8_t *buf) {
  Serial.print("set_leds\r\n");
  fill_solid(&leds[0], NUM_LEDS, gamma_apply(BUFCOL(0)));
  FastLED.show();
}

#define NTRIES 5

uint32_t read_switches() {
  static uint8_t debounce[32] = { 0 };
  uint32_t pressed = 0;
  
  for (int i=0; i<NSWITCHES; i++) {
    bool r = !digitalRead(switchpins[i]);

    if (((switches>>i) ^ r)&1) {
      if (++debounce[i] > NTRIES) {
	debounce[i] = 0;
	//Serial.printf("%d changed to %d\r\n", i, r);
	switches = (switches & ~(1<<i)) | (r<<i);
	int s=i;//switchMap[i];
	pressed |= (1<<i);
      }
    } else {
      debounce[i] = 0;
    }
  }
  //Serial.printf("%08x %08x %08x\r\n", switches, pressed);
  return pressed;
}

void poll_switches(void) {
  uint32_t changed = read_switches(), ch = changed;
  uint32_t pressed = changed & switches;
  if (changed) {
    while (uint8_t b = ffs(ch)) {
      uint32_t mask = 1<<(b-1);
      if (pressed & mask) {
	Serial.printf("%d pressed\r\n", b);
	//	slot[switchMap[b-1]].anim_mode =
	//	  (anim_t)((slot[switchMap[b-1]].anim_mode+1)%8);
      }
      else
	Serial.printf("%d released\r\n", b);
      ch &= ~mask;
    }
  
    webSocket.broadcastTXT(message_string());
    //update_leds();
  }
}
