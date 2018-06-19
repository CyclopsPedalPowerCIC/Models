/*


21/4/18 this is copied from another file, alot of junk code below needs deleting to make this only do the dumpload part of the job

*/


#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <Arduino.h>
#include <TM1637Display.h>



#define numsensors 12
//6 voltages and 6 currents
//also want one global voltage to check for overvoltage?
#define maxpoints 200

//analogue pin:
//int pinADC=A0;
//int pinPWM1=D1; 
//int pinPWM2=D2; 
int pinButton = D1;
int pressed=0;

int CLK1 = D5;  //pins for display
int DIO1 = D6;


TM1637Display Pdisplay(CLK1, DIO1); //display for voltage


const int led = 13;  //indicates when the server is in use
const char* ssid = "Cyclops_Wifi";
const char* password = "skullface";

#define TEST_DELAY   2000

String returnString=""; //this is the string that will be returned after the html request


int duty1=0;
int duty2=0;
int time1=0;
int timedelay=2; //seconds


float dataLog[numsensors+1][maxpoints]={0};
int totalPoints=0;

ESP8266WebServer server(80);

void setup(void){
  
  ESP.eraseConfig();
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(CLK1,OUTPUT);
  pinMode(DIO1,OUTPUT);
  pinMode(pinButton,INPUT);
  Pdisplay.setBrightness(0x0f);

  pinMode(led, OUTPUT);
  digitalWrite(led, 0);
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.println("");
  
  
//pinMode(CLK1,OUTPUT);
//pinMode(CLK2,OUTPUT);
//pinMode(DIO1,OUTPUT);
  setdisplay();
//pinMode(DIO2,OUTPUT);




  // All segments on
  int wait=0;
  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(250);
    digitalWrite(LED_BUILTIN, LOW);
    delay(250);
    Pdisplay.showNumberDec(wait, false);
    wait++;
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

  //include all webpages available here:

  server.on("/", handleRoot);
  server.on("/Button", handleButton);
  server.on("/button", handleButton);
  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");
  digitalWrite(LED_BUILTIN, HIGH);  //off
}

void loop(void){
  server.handleClient();
  checkInputs();
  
  if (millis()-time1>timedelay*1000){//perform ana ftion every "timedelay" # of seconds
    showIP();
    time1=millis();
    }
}

void checkInputs(){
  
  if (!digitalRead(pinButton)) {
    if (pressed==2){pressed=2;}
    else {pressed=1; 
    digitalWrite(LED_BUILTIN, LOW);}
    
    }
    else if (pressed==2){pressed=0;}

//if (!digitalRead(pinButton)) {pressed=1;digitalWrite(LED_BUILTIN, LOW);}
//else {pressed=0;digitalWrite(LED_BUILTIN, HIGH);}
  
  }



void showIP(){
  
   Pdisplay.showNumberDec(WiFi.localIP()[2]*1000+WiFi.localIP()[3],false);
  }



void setdisplay(){
  float power=1230;
  Pdisplay.showNumberDec(power, false);//need to set the formatting correctly, currently probably only uses last two/three didgets. are decimals possible?
  //Serial.print("setdisplay");
  //Pdisplay.showNumberDec(1234, false);
}


void handleButton(){

      if (pressed==1) {returnString="Yes";}
      else {returnString="No";}
      if (!digitalRead(pinButton)) {pressed=2;}
      else {pressed=0;}
      digitalWrite(LED_BUILTIN, HIGH);

  server.sendHeader("Access-Control-Allow-Origin", "*");//should be included automatically, acording to documentation, but isn't for some reason  
server.send(200, "text/plain", returnString);
}




void handleRoot() {
  digitalWrite(led, 1);
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", "hello from esp8266!\n Filename: "+String(__FILE__)+"\n Complile Date: "+String(__DATE__));
  digitalWrite(led, 0);
}

void handleNotFound(){
  digitalWrite(led, 1);
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
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(404, "text/plain", message);
  digitalWrite(led, 0);
}

