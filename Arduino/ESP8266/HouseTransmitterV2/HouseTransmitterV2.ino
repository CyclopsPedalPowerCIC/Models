/*


21/4/18 this is copied from another file, alot of junk code below needs deleting to make this only do the dumpload part of the job

*/

#define Version F("House Transmitter 25/24/18")

#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <Arduino.h>
#include <TM1637Display.h>
//#include <CapacitiveSensor.h>
//#include <ShiftRegister74HC595.h>
#include "aSlave.h"


aHost dataLink;
long start = millis();
long commTime = millis();
long prevTime;

#define MAX_PENDING 40
#define MAX_SOCKETS 64
int pendingComms=0;
char pendingText[7][MAX_PENDING];

//6 voltages and 6 currents
//also want one global voltage to check for overvoltage?


//analogue pin:
int pinADC=A0;
int pinPWM1=D1; 
int pinPWM2=D2; 

int CLK1 = D5;  //pins for display
int DIO1 = D2;


TM1637Display Pdisplay(CLK1, DIO1); //display for voltage

char deviceList[2][MAX_SOCKETS];  //list of all devices avaiable to the house
int deviceStatus[MAX_SOCKETS];
int deviceLocation[MAX_SOCKETS];
long deviceTime[MAX_SOCKETS];
int lightsStatus[10];
int lightsTime[10];
int numberDevices=0;

//int threshold1 = 40; //voltage dumpload starts to come on at 
//int threshold2 = 50;//voltage dumpoad is fully on

const int led = 13;  //indicates when the server is in use
const char* ssid = "Cyclops_Wifi";
const char* password = "skullface";

#define TEST_DELAY   2000

String returnString=""; //this is the string that will be returned after the html request


int duty1=0;
int duty2=0;
int time1=0;
int timedelay=2; //seconds


int totalPoints=0;

ESP8266WebServer server(80);

void setup(void){


  dataLink.deviceID[0]='T';  //beacuse the eeprom code doesn't seemt to work for the esp!
  dataLink.deviceID[1]='E';
     
   
  
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
  setdisplay();


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
  server.on("/Sethouse", handleSet);
  server.on("/setHouse", handleSet);
  server.on("/sethouse", handleSet);
  server.on("/SetHouse", handleSet);
  server.on("/Status", handleStatus);
  server.on("/status", handleStatus);
  server.on("/inline", [](){server.send(200, "text/plain", "this works as well");});
  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");


   dataLink.start();
   dataLink.addFunc('?','D',&getHouse);  //getting sent the state of the house, this will be called multiple times in quick sucession
   dataLink.addFunc('M','?',&setHouse);  //set Modes on the house if relevant (otherwise ignore) as aIDMDM?--- reply aMDNsoco  where N messages pending, so=socket, co=control
  // dataLink.addFunc('?','T',&setTimer);  //set Delay Timer aIDMD?MPTTTT  where P is pin and T is Timer * 0.1 seconds

  resetArrays();

}

void loop(void){
  server.handleClient();
  dataLink.getData();
  
  if (millis()-time1>timedelay*1000){//perform ana ftion every "timedelay" # of seconds
    
   Pdisplay.showNumberDec(WiFi.localIP()[2]*1000+WiFi.localIP()[3],false);
    time1=millis();
    }
}



void handleRawData(){
  
  time1=millis();
returnString="";

server.sendHeader("Access-Control-Allow-Origin", "*");//should be included automatically, acording to documentation, but isn't for some reason  
server.send(200, "text/plain", returnString);
}


void setHouse(){
  char tempString[10];
  if (pendingComms>0) {
  tempString[0]= (pendingComms/10)+0x30;
  tempString[1]= (pendingComms%10)+0x30;
  tempString[2]= pendingText[0][pendingComms-1];//send the last command to be recieved
  tempString[3]= pendingText[1][pendingComms-1];
  tempString[4]= pendingText[2][pendingComms-1];
  tempString[5]= pendingText[3][pendingComms-1];
  tempString[6]= pendingText[4][pendingComms-1];
  tempString[7]= pendingText[5][pendingComms-1];
  tempString[8]= pendingText[6][pendingComms-1];
  tempString[9]= '\0';
  
  strcpy(dataLink.returnString,tempString);
  dataLink.reply();
  //Serial.print(tempString);
  pendingComms--;
    }
  else{
   strcpy(dataLink.returnString,"00-------");
   dataLink.reply();
  }
  }

void getHouse(){
  //gets data from house, run when it is recieved
  //currently no check that the messages are all recieved/any error checking at all.

/*char* deviceList[2][64];  //list of all devices avaiable to the house
int deviceStatus[64];
int deviceLocation[64];
int deviceTime[64];
int lightsStatus[10];
int lightsTime[10];
*/
if (dataLink.stringBuffer[4]=='0'){//get lights data
  prevTime= millis()-commTime;
  commTime = millis(); 
  for (int i=0;i<numberDevices;i++){deviceStatus[i]=0;}//set device as disconnected unless further communciations say otherwise
  for (int i=0;i<8;i++){
    if (bitRead(dataLink.stringBuffer[8],i)){
  lightsStatus[i]=1;
  lightsTime[i]+=prevTime;
  }
  else  lightsStatus[i]=0;
  }
  for (int i=0;i<(10-8);i++){
    if (bitRead(dataLink.stringBuffer[9],i)){
  lightsStatus[i+8]=1;
  lightsTime[i+8]+=prevTime;
  }
  else  lightsStatus[i+8]=0;
  }
  
}
else {//get socket data

  int messageNumber=dataLink.stringBuffer[4]-'0';
  int i;
  for (i=0;i<numberDevices;i++){
  char char1=dataLink.stringBuffer[10];
  char char2=deviceList[0][i];
  char char3=dataLink.stringBuffer[11];
  char char4=deviceList[1][i];
    if (((dataLink.stringBuffer[10])==(deviceList[0][i]))&&((dataLink.stringBuffer[11])==(deviceList[1][i]))){//already known: get number, check location and add to "on time"
        deviceLocation[i]=String(dataLink.stringBuffer).substring(8,10).toInt();
        if ((dataLink.stringBuffer[7]-'0')==1){//device is on
          deviceTime[i]+=prevTime;//add amount of time since last communication
          }
        else{ //device is off
          
          }
          deviceStatus[i]=(dataLink.stringBuffer[7]-'0');
          return;
      }
      
        //new device
        
    }
        deviceList[0][i]=dataLink.stringBuffer[10];//new device, add it to the list
        deviceList[1][i]=dataLink.stringBuffer[11];
        deviceStatus[i]=(dataLink.stringBuffer[7]-'0');
        deviceLocation[i]=String(dataLink.stringBuffer).substring(8,10).toInt();
        deviceTime[i]=0;
        numberDevices++;
  }
   
}

void setdisplay(){
  float power=1230;
  Pdisplay.showNumberDec(power, false);//need to set the formatting correctly, currently probably only uses last two/three didgets. are decimals possible?
  //Serial.print("setdisplay");
  //Pdisplay.showNumberDec(1234, false);
}

void handleSet(){
  

  int sNum=-1;
  int sState=-1;
  int sLink=-1;
  
  for (uint8_t i=0; i<server.args(); i++){
    if (server.argName(i)=="Number") {sNum= server.arg(i).toInt();}
    if (server.argName(i)=="State") {sState= server.arg(i).toInt();}
    if (server.argName(i)=="Link") {sLink= server.arg(i).toInt();}
  
  }

  if (sLink==99){resetArrays();}
  
  if ((sNum>-1)&&(sLink>-1)&&(sState>0)&&((pendingComms+1)<MAX_PENDING)){

    pendingText[0][pendingComms]=((sNum/10)%10)+0x30;
    pendingText[1][pendingComms]=((sNum)%10)+0x30;
    pendingText[2][pendingComms]=((sState/100)%10)+0x30;
    pendingText[3][pendingComms]=((sState/10)%10)+0x30;
    pendingText[4][pendingComms]=(sState%10)+0x30;
    pendingText[5][pendingComms]=((sLink/10)%10)+0x30;
    pendingText[6][pendingComms]=((sLink)%10)+0x30;
    pendingComms++;
    
  returnString="Set... ";
  returnString+=char((pendingComms/10)+0x30);
  returnString+=char((pendingComms%10)+0x30);
  returnString+=" commands not yet dealt with\n";
  returnString+="State: 1= toggle; 2= off; 3= on; 5+ touch + 100ms per integer timer, max 999\n";
  returnString+="Links: 0-6= control 1 7-13 control2 etc etc\n";
  returnString+="Number= socket number, lights numbered 70-77 (and above if more are added)";
  
  
  server.sendHeader("Access-Control-Allow-Origin", "*");//should be included automatically, acording to documentation, but isn't for some reason  
  server.send(200, "text/plain", returnString);  
  }
  else{
  server.sendHeader("Access-Control-Allow-Origin", "*");//should be included automatically, acording to documentation, but isn't for some reason  
  server.send(200, "text/plain", "Failed");  
    }
  }

void resetArrays(){
for (int i=0;i<MAX_SOCKETS;i++){
  deviceList[0][i]=0;
  deviceList[1][i]=0;
  deviceTime[i]=0;
  deviceLocation[i]=0;
  deviceStatus[0]=0;
  numberDevices=0;
  }

for (int i=0;i<10;i++){
 lightsStatus[i]=0;
 lightsTime[i]=0;
}

}

void handleStatus(){

/*char* deviceList[2][64];  //list of all devices avaiable to the house
int deviceStatus[64];
int deviceLocation[64];
int deviceTime[64];
int lightsStatus[10];
int lightsTime[10];*/
  
  returnString="Lights: ";
  for (int i=0;i<10;i++){
    returnString+=lightsStatus[i];
    returnString+="-";
    returnString+=lightsTime[i];
    returnString+=" ";
    }
    returnString+="\n";
  for(int i=0;i<numberDevices;i++){
    
    returnString+="Device"+String(i)+": ";
    //char tempch[3];
    //itoa(deviceList[1][i],tempch,16);  //alternative way to get hex data into a string
    //returnString+=String(tempch);
    returnString+=String(deviceList[0][i],HEX);
    returnString+="-";
    returnString+=String(deviceList[1][i],HEX);
    returnString+=" ";
    returnString+=deviceLocation[i];
    returnString+=" ";
    returnString+=deviceTime[i];
    returnString+=" ";
    returnString+=deviceStatus[i];
    returnString+="\n";
    }
  server.sendHeader("Access-Control-Allow-Origin", "*");//should be included automatically, acording to documentation, but isn't for some reason  
  server.send(200, "text/plain", returnString);
  }

void handleRoot() {
  digitalWrite(led, 1);
  server.sendHeader("Access-Control-Allow-Origin", "*");//should be included automatically, acording to documentation, but isn't for some reason
  server.send(200, "text/plain", String("Cyclops ESP Version: ")+String(Version));
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
  server.sendHeader("Access-Control-Allow-Origin", "*");//should be included automatically, acording to documentation, but isn't for some reason
  server.send(404, "text/plain", message);
  digitalWrite(led, 0);
}

