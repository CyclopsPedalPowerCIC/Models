#define FASTLED_ESP8266_RAW_PIN_ORDER  //needed to stop the fastLED library being too clever for its own good and assuming D2->GPOI19->D19
#define FASTLED_ALLOW_INTERRUPTS 0
#include "FastLED.h"
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <WebSocketsServer.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

#define Version F("City LIghts 08/10/18")
#define NLEDS 28

const char* ssid = "Cyclops_Wifi";
const char* password = "skullface";

ESP8266WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

// How many leds in your strip?
#define NUM_LEDS 600   //more than needed

#define PIN_DATA595   D0
#define PIN_CLK595    D2
#define PIN_LATCH595  D1
#define PIN_SWITCH    D3
#define PIN_LEDS      D4
//#define buttonePin D1
//serial=D0, clock=D2, latch=D1

// For led chips like Neopixels, which have a data line, ground, and power, you just
// need to define DATA_PIN.  For led chipsets that are SPI based (four wires - data, clock,
// ground, and power), like the LPD8806 define both DATA_PIN and CLOCK_PIN
//#define CLOCK_PIN 13

// Define the array of leds
CRGB leds[NUM_LEDS];
//int switchMap[28]={24,23,30,31,0,1,7,9,8,27,28,26,25,29,21,19,22,18,20,12,11,13,10,4,5,6,3,2};  //lights->switches, wrong way round
int switchMap[32]={4,5,27,26,23,24,25,6,8,7,22,20,19,21,28,28,28,28,17,15,18,14,16,1,0,12,11,9,10,13,2,3};  //switches->lights
int rfidMap[28]={13,9,12,11,10,17,14,18,15,16,3,0,1,2,6,7,4,5,8,25,27,24,26,23,21,19,22,20}; //rfid readers->lights

uint8_t switchState[28]={0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};

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
  if (MDNS.begin("citymaster")) {
    Serial.println("MDNS responder started");
  }

  server.on("/", handleRoot);
  server.on("/setBlock", handleBlock);
  server.on("/setCorner", handleCorner);
  server.on("/getSwitches", handleSwitch);

  server.begin();
  Serial.println("HTTP server started");
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  Serial.println("WS server started");
}

void setup() { 
  Serial.begin(115200);
  Serial.print("\r\n\r\n\r\ncitylights (" __TIME__ " " __DATE__ ")\r\n");
  init_server();

  FastLED.addLeds<WS2812B, PIN_LEDS, GRB>(leds, NUM_LEDS);
  //FastLED.setBrightness(127);

  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(PIN_LATCH595, OUTPUT); 
  pinMode(PIN_CLK595, OUTPUT); 
  pinMode(PIN_DATA595, OUTPUT); 
  pinMode(PIN_SWITCH, INPUT);
  digitalWrite(PIN_SWITCH,0);
  pinMode(PIN_LEDS, OUTPUT); 

  for (int i=0;i<28;i++){
    setBlock(i,CRGB::Green);
    delay(40);
    FastLED.show();
  } 
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
    if (length == NLEDS*3) {
      set_leds(payload);
    }
    webSocket.sendTXT(num, message_string());
    break;
  }
}

void set_leds(uint8_t *buf) {
  Serial.print("set_leds\r\n");
  for (int i=0; i<NLEDS; i++, buf+=3) {
    setBlock(i,CRGB(buf[0],buf[1],buf[2]));
  }
  FastLED.show();
}

void write595(const uint8_t *arr, uint8_t len) {
  while (len--)
    shiftOut(PIN_DATA595, PIN_CLK595, MSBFIRST, arr[len]);
  digitalWrite(PIN_LATCH595, HIGH); 
  digitalWrite(PIN_LATCH595, LOW); 
}

static inline void set_latch(uint8_t *arr, uint8_t bitno, bool val) {
  uint8_t mask = 1<<(bitno&7);
  arr[bitno>>3] &= ~mask;
  arr[bitno>>3] |= val?mask:0;
}

unsigned long lastelapsed;

void loop() { 
  unsigned long t1, t2;
  t1 = millis();
  poll_switches();
  server.handleClient();
  webSocket.loop();
  if (WiFi.status() != WL_CONNECTED) {
    init_wifi();
  }
  t2 = millis();
  lastelapsed = t2-t1;
  Serial.printf("elapsed %d  \r", lastelapsed);
}

uint8_t shiftreg[3] = { 0 };

uint32_t switches = 0;
#define NTRIES 5

uint32_t read_switches() {
  static uint8_t debounce[32] = { 0 };
  uint32_t pressed = 0;
  
  for (int i=0; i<32; i++) {
    set_latch(shiftreg, 3, i&1);
    set_latch(shiftreg, 2, i&2);
    set_latch(shiftreg, 1, i&4);
    set_latch(shiftreg, 0, i&8);
    set_latch(shiftreg, 4, i&16);
    set_latch(shiftreg, 5, !(i&16));
    write595(shiftreg, sizeof shiftreg);
    bool r = !digitalRead(D3);

    if (((switches>>i) ^ r)&1) {
      if (++debounce[i] > NTRIES) {
	debounce[i] = 0;
	//Serial.printf("%d changed to %d\r\n", i, r);
	switches = (switches & ~(1<<i)) | (r<<i);
	setCorner(switchMap[i],r?CRGB::Yellow:CRGB::White);
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
      if (pressed & mask)
	Serial.printf("%d pressed\r\n", b);
      else
	Serial.printf("%d released\r\n", b);
      ch &= ~mask;
    }
  
    webSocket.broadcastTXT(message_string());
    FastLED.show();
  }
}

char *message_string() {
  static char buf[16];
  snprintf(buf, sizeof buf, "%d", switches);
  return buf;
}

CRGB parse_colour(const char **text) {
  int r,g,b;
  sscanf(*text, "%02x%02x%02x", &r, &g, &b);
}

void handleBlock(){

  int bNumber=-1;
  CRGB bColour;
  Serial.print("handleBlock called");
  for (uint8_t i=0; i<server.args(); i++){
    if (server.argName(i)=="number"){
      Serial.print("number");
      bNumber=server.arg(i).toInt();
    } 
    if (server.argName(i)=="red"){
      Serial.print("red");
      bColour.r=server.arg(i).toInt();
    }
    if (server.argName(i)=="green"){
      Serial.print("green");
      bColour.g=server.arg(i).toInt();
    }
    if (server.argName(i)=="blue"){
      Serial.print("blue");
      bColour.b=server.arg(i).toInt();
    }  

  }
  Serial.print("handleBlock middle");
  if ((bNumber>-1)&&(bNumber<28)){
    setBlock(bNumber,bColour);

    FastLED.show();
    server.send(200, "text/plain", "Set");
  }
  else {  server.send(200, "text/plain", "Failed");}

  Serial.print("handleBlock end");
}


void handleRoot() {
  server.send(200, "text/plain", message_string());
}


void handleCorner(){

  int bNumber=-1;
  CRGB bColour;
  //Serial.print("handleBlock called");
  for (uint8_t i=0; i<server.args(); i++){
    if (server.argName(i)=="number"){
      //  Serial.print("number");
      bNumber=server.arg(i).toInt();
    } 
    if (server.argName(i)=="red"){
      //Serial.print("red");
      bColour.r=server.arg(i).toInt();
    }
    if (server.argName(i)=="green"){
      //Serial.print("green");
      bColour.g=server.arg(i).toInt();
    }
    if (server.argName(i)=="blue"){
      //Serial.print("blue");
      bColour.b=server.arg(i).toInt();
    }  

  }
  //  Serial.print("handleBlock middle");
  if ((bNumber>-1)&&(bNumber<28)){
    setCorner(bNumber,bColour);

    FastLED.show();
    server.send(200, "text/plain", "Set");
  }
  else {  server.send(200, "text/plain", "Failed");}


}

void setBlock(int number, CRGB colour){

  int start=19*number;
  for (int i=0;i<15;i++){

    leds[i+2+start]=colour;
  }

}


void setCorner(int number, CRGB colour){
  int start=19*number;

  for (int i=0;i<2;i++){

    leds[i+start]=colour;
    leds[i+17+start]=colour;
  }

}

void handleSwitch(){

  String returnString="";
  for (int i=0;i<28;i++){
    returnString+=switchState[i];    
  }
  server.send(200, "text/plain", returnString);
}
