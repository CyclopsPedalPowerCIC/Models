//#define FASTLED_ESP8266_NODEMCU_PIN_ORDER //this appears to be its default behaviour
#define FASTLED_ESP8266_RAW_PIN_ORDER  //needed to stop the fastLED library being too clever for its own good and assuming D2->GPOI19->D19
#define FASTLED_ALLOW_INTERRUPTS 0
#include "FastLED.h"
#include <ShiftRegister74HC595.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

#define Version F("City LIghts 08/10/18")


const char* ssid = "Cyclops_Wifi";
const char* password = "skullface";

ESP8266WebServer server(80);


// How many leds in your strip?
#define NUM_LEDS 600   //more than needed
ShiftRegister74HC595 sr (24, D0, D2, D1); 
//#define buttonePin D1

// For led chips like Neopixels, which have a data line, ground, and power, you just
// need to define DATA_PIN.  For led chipsets that are SPI based (four wires - data, clock,
// ground, and power), like the LPD8806 define both DATA_PIN and CLOCK_PIN
#define DATA_PIN D4
//#define CLOCK_PIN 13

// Define the array of leds
CRGB leds[NUM_LEDS];
//int switchMap[28]={24,23,30,31,0,1,7,9,8,27,28,26,25,29,21,19,22,18,20,12,11,13,10,4,5,6,3,2};  //lights->switches, wrong way round
int switchMap[32]={4,5,27,26,23,24,25,6,8,7,22,20,19,21,28,28,28,28,17,15,18,14,16,1,0,12,11,9,10,13,2,3};  //switches->lights
int rfidMap[28]={13,9,12,11,10,17,14,18,15,16,3,0,1,2,6,7,4,5,8,25,27,24,26,23,21,19,22,20}; //rfid readers->lights

int switchState[28]={0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};

void setup() { 
  Serial.begin(9600);


      ESP.eraseConfig();
        WiFi.begin(ssid, password);

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(250);
    digitalWrite(LED_BUILTIN, LOW);

    Serial.print(".");
    //setdisplay();
  }
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  if (MDNS.begin("esp8266")) {
    Serial.println("MDNS responder started");
  }
      server.on("/", handleRoot);
    server.on("/setBlock", handleBlock);
    server.on("/setCorner", handleCorner);
    server.on("/getSwitches", handleSwitch);
      server.onNotFound(handleNotFound);
  server.begin();
      FastLED.addLeds<WS2812B, DATA_PIN, GRB>(leds, NUM_LEDS);
      //FastLED.setBrightness(127);

      pinMode(LED_BUILTIN, OUTPUT);
      pinMode(D0, OUTPUT); 
      pinMode(D1, OUTPUT); 
      pinMode(D2, OUTPUT); 
      pinMode(D3, INPUT);
      digitalWrite(D3,0); 
      pinMode(D4, OUTPUT); 

  for (int i=0;i<28;i++){
    
    setBlock(i,CRGB::Green);
    delay(40);
    checkSwitches();
    FastLED.show();
    }
    for (int i=0;i<28;i++){
    
    setBlock(i,CRGB::Green);
    delay(40);
    checkSwitches();
    FastLED.show();
    } 
      
}

void loop() { 

  checkSwitches();
  server.handleClient();
  
}

void checkSwitches(){
  
  for (int i=0;i<32;i++){
    
    sr.set(3,i%2);  //S0
    sr.set(2,(i/2)%2); //S1
    sr.set(1,(i/4)%2); //S2
    sr.set(0,(i/8)%2); //S3
    sr.set(4,(i/16)%2); //En1
    sr.set(5,(i/16+1)%2); //En2
    delay(1);
    if (!digitalRead(D3)){
      Serial.print(i);
      
    setCorner(switchMap[i],CRGB::Yellow);
    switchState[i]=1;  //records if the switch has been pressed
      }
    else {
      //Serial.print(" ");
      
    setCorner(switchMap[i],CRGB::White);
      }
    
    }
    //Serial.println("");

  FastLED.show();
  
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
  //digitalWrite(led, 1);
  server.sendHeader("Access-Control-Allow-Origin", "*");//should be included automatically, acording to documentation, but isn't for some reason
  server.send(200, "text/plain", String("Cyclops ESP Version: ")+String(Version));
  //digitalWrite(led, 0);
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


void handleNotFound(){
//  digitalWrite(led, 1);
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET)?"GET":"POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint8_t i=0; i<server.args(); i++){
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.sendHeader("Access-Control-Allow-Origin", "*");//should be included automatically, acording to documentation, but isn't for some reason
  server.send(404, "text/plain", message);
  //digitalWrite(led, 0);
}

  
