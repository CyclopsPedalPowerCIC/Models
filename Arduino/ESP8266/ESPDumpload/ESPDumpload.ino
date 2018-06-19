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
int pinADC=A0;
int pinPWM1=D1; 
int pinPWM2=D2; 

int CLK1 = D5;  //pins for display
int DIO1 = D6;


TM1637Display Pdisplay(CLK1, DIO1); //display for voltage



int threshold1 = 40; //voltage dumpload starts to come on at 
int threshold2 = 50;//voltage dumpoad is fully on

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
  Pdisplay.setBrightness(0x0f);

  pinMode(led, OUTPUT);
  digitalWrite(led, 0);
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  Serial.println("");
  
  
pinMode(pinPWM1,OUTPUT);
pinMode(pinPWM2,OUTPUT);
pinMode(pinADC,INPUT);
//pinMode(CLK1,OUTPUT);
//pinMode(CLK2,OUTPUT);
//pinMode(DIO1,OUTPUT);
  setdisplay();
//pinMode(DIO2,OUTPUT);


  

 // delay(TEST_DELAY);



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
 // server.on("/RawData", handleRawData);
 // server.on("/RawDataOnly", handleRawDataOnly);
//  server.on("/Data", handleData);
//  server.on("/ChangeSensors",[](){
//  server.send(200, "text/plain", "this will change the number of sensors when I get around to adding that function");});
//  server.on("/DataOnly", handleDataOnly);
//  server.on("/MashTemp", handlemashTemp);
  server.on("/Set", handleSet);
  server.on("/set", handleSet);
  server.on("/inline", [](){server.send(200, "text/plain", "this works as well");});
  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");

}

void loop(void){
  server.handleClient();

  //checkvoltage();  //turn on dumpload if voltage is too high
  //setdisplay();
  showIP();
  if (millis()-time1>timedelay*1000){//perform ana ftion every "timedelay" # of seconds
    time1=millis();
    }
}

void checkvoltage(){
  
//  check for an overvoltage situation
  float maxVal=0;

  if (maxVal>threshold2){
    analogWrite(pinPWM1,1);
    }
  else if (maxVal>threshold1){
    int value = ((maxVal-threshold1)*1023)/(threshold2-threshold1);
    analogWrite(pinPWM1,value);
    
    }
  else if(maxVal<threshold1){
    analogWrite(pinPWM1,0);
    }
  }




void handleRawData(){
  time1=millis();
returnString="";



  
server.send(200, "text/plain", returnString);
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


void handleSet(){
 for (uint8_t i=0; i<server.args(); i++){
    if(server.argName(i)="Duty") {
      duty1= server.arg(i).toInt()/2;
      duty2= server.arg(i).toInt()/2+server.arg(i).toInt()%2;
      
      }
      if (duty1>=PWMRANGE){duty1=PWMRANGE-1;}
      if (duty2>=PWMRANGE){duty2=PWMRANGE-1;}
      if (duty1<0){duty1=0;}
      if (duty2<0){duty2=0;}
      
      returnString="set duty cycle to:: ";
      returnString+=String(duty1+duty2);
      returnString+="\nMaximum duty cycle=";
      returnString+=String(PWMRANGE*2-2);
  }
  if (returnString=="") {returnString="failed";}
  
  setDumpload();
  server.sendHeader("Access-Control-Allow-Origin", "*");//should be included automatically, acording to documentation, but isn't for some reason  
  server.send(200, "text/plain", returnString);
}


void setDumpload(){
  
    analogWrite(pinPWM1,duty1);
    analogWrite(pinPWM2,duty2);
    
  
  
  }


void handleRoot() {
  digitalWrite(led, 1);
  server.send(200, "text/plain", "hello from esp8266!");
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
  server.send(404, "text/plain", message);
  digitalWrite(led, 0);
}

