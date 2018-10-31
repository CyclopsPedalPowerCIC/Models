#define FASTLED_ESP8266_RAW_PIN_ORDER  //needed to stop the fastLED library being too clever for its own good and assuming D2->GPOI19->D19
#define FASTLED_ALLOW_INTERRUPTS 0
#include "FastLED.h"
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <WebSocketsServer.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

#define NSLOTS 28

ESP8266WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

#define NUM_LEDS 600   //more than needed

#define PIN_DATA595   D0
#define PIN_CLK595    D2
#define PIN_LATCH595  D1
#define PIN_SWITCH    D3
#define PIN_LEDS      D4

// Define the array of leds
CRGB leds[NUM_LEDS];
int revswitchMap[28]={24,23,30,31,0,1,7,9,8,27,28,26,25,29,21,19,22,18,20,12,11,13,10,4,5,6,3,2};  //lights->switches, wrong way round
int switchMap[32]={4,5,27,26,23,24,25,6,8,7,22,20,19,21,28,28,28,28,17,15,18,14,16,1,0,12,11,9,10,13,2,3};  //switches->lights
int rfidMap[28]={13,9,12,11,10,17,14,18,15,16,3,0,1,2,6,7,4,5,8,25,27,24,26,23,21,19,22,20}; //rfid readers->lights

int floodLevel=2;
int floodleds1[][2]=  //starting pixel and number of pixels to be "flooded"
    {{19*11+11,8},  //flooding level 1
    {19*12+11,8},
    {19*13+11,8},
    {19*25+4,3},
    {19*17+4,3},
    {19*19+0,8},
    {19*18+12,5},
    {19*20+11,8},
    {19*20+4,3},
    {19*22+11,4}};
    
int floodleds2[][2]=
    {{19*11+9,10},  //flooding level 2
    {19*11+0,3},
    {19*12+9,10},
    {19*12+0,3},
    {19*13+9,10},
    {19*13+0,3},
    {19*25+2,7},
    {19*17+2,7},
    {19*19+0,10},
    {19*19+16,3},
    {19*18+9,10},
    {19*20+0,19},
    {19*22+9,8}};

int floodleds3[][2]=
    {{19*10+9,8},              //flooding level 3
    {19*11+0,19},
    {19*12+0,19},
    {19*13+0,19},
    {19*25+1,11},
    {19*17+0,19},
    {19*16+11,5},
    {19*9+11,3},
    {19*14+6,7},
    {19*19+0,12},
    {19*19+14,5},
    {19*18+0,19},
    {19*20+0,19},
    {19*22+9,8}};
    



uint32_t switches = 0;

typedef enum { ANIM_NONE=0, ANIM_FLASH_SLOW, ANIM_FLASH_FAST,
	       ANIM_CRAWL_SLOW_LEFT, ANIM_CRAWL_SLOW_RIGHT,
	       ANIM_CRAWL_FAST_LEFT, ANIM_CRAWL_FAST_RIGHT,
	       ANIM_DISCO
} anim_t;

bool animating = true;
uint32_t frame;

struct {
  CRGB main_colour, main_flash_colour,
    tip_colour, tip_highlight_colour;
  anim_t anim_mode;
  int frame;
} slot[NSLOTS] = {
  CRGB(0,0,0),
  CRGB(255,255,255),
  CRGB(0,0,0),
  CRGB(0,0,0),
  ANIM_NONE, //FLASH_SLOW,
  0
};

// bytes per slot in ws payload
#define SLOTSIZE (13)

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

  for (int i=1; i<NSLOTS; i++)
    slot[i] = slot[0];
  
  FastLED.addLeds<WS2812B, PIN_LEDS, GRB>(leds, NUM_LEDS);
  //FastLED.setBrightness(127);

  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(PIN_LATCH595, OUTPUT); 
  pinMode(PIN_CLK595, OUTPUT); 
  pinMode(PIN_DATA595, OUTPUT); 
  pinMode(PIN_SWITCH, INPUT);
  digitalWrite(PIN_SWITCH,0);
  pinMode(PIN_LEDS, OUTPUT); 

  for (int i=0;i<NSLOTS;i++){
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
    if (length == NSLOTS*SLOTSIZE) {
      set_leds(payload);
    }
    webSocket.sendTXT(num, message_string());
    break;
  }
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

void update_leds() {
  for (int i=0; i<NSLOTS; i++) {
    uint32_t f = frame-slot[i].frame;
    switch (slot[i].anim_mode) {
    case ANIM_NONE:
      setBlock(i,slot[i].main_colour);
      break;
    case ANIM_FLASH_SLOW:
      setBlock(i,blend(slot[i].main_colour,
		       slot[i].main_flash_colour,
		       quadwave8 (f>>2)));
      break;
    case ANIM_FLASH_FAST:
      setBlock(i,blend(slot[i].main_colour,
		       slot[i].main_flash_colour,
		       quadwave8 (f)));
      break;
    case ANIM_CRAWL_SLOW_LEFT:
      set_crawl_from_default(i, (f<<2),
		0b1111000011110000
		);
      break;
    case ANIM_CRAWL_SLOW_RIGHT:
      set_crawl_from_default(i, ~(f<<2),
		0b11110000
		);
      break;
    case ANIM_CRAWL_FAST_LEFT:
      set_crawl_from_default(i, (f<<3),
		0b111000
		);
      break;
    case ANIM_CRAWL_FAST_RIGHT:
      set_crawl_from_default(i, ~(f<<3),
		0b1100
		);
    case ANIM_DISCO:
      switch ((f>>9)&7) {
      case 0: case 1:
	setBlock(i,blend(CRGB::Black,
			 CRGB::Blue,
			 quadwave8 (f>>1)));
	break;
      case 2: case 3:
	set_crawl(i, (f<<2), 0b111000000,
		  CRGB::Black, CRGB::Yellow
		  );
	break;
      case 4: case 5:
	setBlock(i,blend(CRGB::Black,
			 CRGB::Red,
			 quadwave8 (f>>1)));
	break;
      case 6: case 7:
	set_crawl(i, ~(f<<2), 0b111000000,
		  CRGB::Black, CRGB::Green
		  );
	break;
      default:
	setBlock(i,CRGB::Black);
      }
      break;
    }
    
    setCorner(i, ((switches >> revswitchMap[i])&1) ? slot[i].tip_highlight_colour :
	      slot[i].tip_colour);

  }
  if (1){  //((frame%200)>50){ //(1){//
  flood(3);}
  //add in flooding code here...
  FastLED.show();
}


void flood(int level){

  if (level==0){return;} //there is no flooding

  if (level==1){
    for (int i=0;i<(sizeof floodleds1 / sizeof floodleds1[0]);i++){
       fill_solid(&leds[floodleds1[i][0]], floodleds1[i][1], gamma_apply(CRGB::Blue));
    }
  }
  else if (level==2){
    for (int i=0;i<(sizeof floodleds2 / sizeof floodleds2[0]);i++){
       //fill_solid(&leds[floodleds2[i][0]], floodleds2[i][1], gamma_apply(CRGB::Blue));
       for (int j=0;j<floodleds2[i][1];j++){
       leds[j+floodleds2[i][0]].b=abs((frame%5110)/10-255);  //fades the blue in smoothly
       leds[j+floodleds2[i][0]].r=min(int(leds[j+floodleds2[i][0]].r),(255-abs((frame%5110)/10-255))/2); //fades r/g out smoothly
       leds[j+floodleds2[i][0]].g=min(int(leds[j+floodleds2[i][0]].g),(255-abs((frame%5110)/10-255))/2);
      }
    }
  }
  else if (level==3){
    for (int i=0;i<(sizeof floodleds3 / sizeof floodleds3[0]);i++){
       //fill_solid(&leds[floodleds3[i][0]], floodleds3[i][1], gamma_apply(CRGB::Blue));
       for (int j=0;j<floodleds3[i][1];j++){
       leds[j+floodleds3[i][0]].b=abs((frame%5110)/10-255);  //fades the blue in smoothly
       leds[j+floodleds3[i][0]].r=min(int(leds[j+floodleds3[i][0]].r),(255-abs((frame%5110)/10-255))/2); //fades r/g out smoothly
       leds[j+floodleds3[i][0]].g=min(int(leds[j+floodleds3[i][0]].g),(255-abs((frame%5110)/10-255))/2);
      }
    }
  }
}


void set_leds(uint8_t *buf) {
  Serial.print("set_leds\r\n");
  animating = false;
  for (int i=0; i<NSLOTS; i++, buf+=SLOTSIZE) {
    anim_t lastanim = slot[i].anim_mode,
      thisanim = (anim_t)buf[12];
    slot[i].main_colour = BUFCOL(0);
    slot[i].main_flash_colour = BUFCOL(3);
    slot[i].tip_colour = BUFCOL(6);
    slot[i].tip_highlight_colour = BUFCOL(9);
    slot[i].anim_mode = thisanim;
    if (thisanim) animating = true;
    if (lastanim != slot[i].anim_mode) {
      slot[i].frame = frame; // restart animation on mode change
    }
  }
  if (floodLevel>0) animating = true;  //because the flood is animated
  update_leds();
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
  frame = t1;
  poll_switches();
  server.handleClient();
  webSocket.loop();
  if (animating)
    update_leds();
  if (WiFi.status() != WL_CONNECTED) {
    init_wifi();
  }
  t2 = millis();
  lastelapsed = t2-t1;
  Serial.printf("elapsed %d  \r", lastelapsed);
}

uint8_t shiftreg[3] = { 0 };

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
	int s=switchMap[i];
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
    update_leds();
  }
}

char *message_string() {
  static char buf[16];
  snprintf(buf, sizeof buf, "%d", switches);
  return buf;
}
#if 0
CRGB parse_colour(const char **text) {
  int r,g,b;
  sscanf(*text, "%02x%02x%02x", &r, &g, &b);
}
#endif
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

 void set_crawl_from_default(int n, uint32_t phase, uint32_t pattern) {
   set_crawl(n, phase, pattern,
	     slot[n].main_colour,
	     slot[n].main_flash_colour);
 }

void set_crawl(int n, uint32_t phase, uint32_t pattern,
		CRGB in1, CRGB in2) {
  int len=32-__builtin_clz(pattern);
  for (uint32_t i=0;i<15;i++){
    bool thisc=1&(pattern>>((i+(phase>>8))%len)),
         nextc=1&(pattern>>((i+(phase>>8)+1)%len));
    CRGB c1 = thisc ? in2 : in1,
      c2 = nextc ? in2 : in1;
    leds[i+2+19*n]=gamma_apply(blend(c1, c2, phase&255));
  }
}  

void setBlock(int number, CRGB colour){
  fill_solid(&leds[19*number+2], 15, gamma_apply(colour));
}

void setCorner(int number, CRGB colour){
  fill_solid(&leds[19*number], 2, gamma_apply(colour));
  fill_solid(&leds[19*number+17], 2, gamma_apply(colour));
}

void handleSwitch(){
  String returnString="";
  for (int i=0;i<28;i++){
    returnString+=!!(switches>>i);
  }
  server.send(200, "text/plain", returnString);
}
