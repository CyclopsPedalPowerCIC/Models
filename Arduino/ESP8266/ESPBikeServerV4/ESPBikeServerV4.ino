
//has correct configuration settings for board constructed on 24/4/2018

#include <ESP8266WiFi.h>
#include <WiFiClient.h> 
#include <ESP8266WebServer.h>
#include <Arduino.h>
#include <TM1637Display.h>


#define numsensors 12
//6 voltages and 6 currents
//also want one global voltage to check for overvoltage?
#define maxpoints 200

//pins fo the multiplexer
int pinEN=D4;
int pinS0=D3;
int pinS1=D2;
int pinS2=D1;
int pinS3=D0;
//analogue pin:
int pinAna=A0;
int pinPWM=D5; //not actually set yet// now set

int CLK1 = D6;  //pins for display
int DIO1 = D7;

TM1637Display Pdisplay(CLK1, DIO1); //display for voltage


int threshold1 = 40; //voltage dumpload starts to come on at 
int threshold2 = 50;//voltage dumpoad is fully on

const int led = 13;  //indicates when the server is in use


int data[numsensors]={0};
float values[numsensors]={0};

String returnString=""; //this is the string that will be returned after the html request



long time1=0;
int timedelay=2; //seconds


float dataLog[numsensors+1][maxpoints]={0};
int totalPoints=0;



//const char* ssid = "VM6035777";
//const char* password = "7twtrxBPdndn";


//const char* ssid = "BTHomeHub2-K6QJ";
//const char* password = "24b37e3a32";

//const char* ssid = "SKY05064";
//const char* password = "REBWBVYF";


/* Set these to your desired credentials. */
const char *ssid = "Cyclops_Wifi";
const char *password = "skullface";

ESP8266WebServer server(80);

/* Just a little test message.  Go to http://192.168.4.1 in a web browser
 * connected to this access point to see it.
 */
void handleRoot() {
  digitalWrite(led, 1);
  server.sendHeader("Access-Control-Allow-Origin", "*");//should be included automatically, acording to documentation, but isn't for some reason
  server.send(200, "text/plain", "hello from esp8266!");
  digitalWrite(led, 0);
  Serial.print("rootfile accessed");
}



void setup() {
  
  ESP.eraseConfig();
	//delay(1000);
  pinMode(led, OUTPUT);
  digitalWrite(led, 0);
  
  Pdisplay.setBrightness(0x0f);
    
  pinMode(pinEN,OUTPUT);
  pinMode(pinS0,OUTPUT);
  pinMode(pinS1,OUTPUT);
  pinMode(pinS2,OUTPUT);
  pinMode(pinS3,OUTPUT);
  pinMode(pinPWM,OUTPUT);
  pinMode(pinAna,INPUT);
  pinMode(LED_BUILTIN,OUTPUT);
  pinMode(CLK1,OUTPUT);
//  pinMode(CLK2,OUTPUT);
  pinMode(DIO1,OUTPUT);
  //pinMode(DIO2,OUTPUT);
    
    
  

  
	Serial.begin(115200);
	Serial.println();
	Serial.print("Configuring access point...");
	/* You can remove the password parameter if you want the AP to be open. */
	//WiFi.softAP(ssid, password);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  int wait=0;
  while (WiFi.status() != WL_CONNECTED) {
    
    digitalWrite(LED_BUILTIN, HIGH);
    delay(250);
    digitalWrite(LED_BUILTIN, LOW);
    delay(250);
    Pdisplay.showNumberDec(wait, false);
    wait++;
    Serial.print(".");
  }

	//IPAddress myIP = WiFi.softAPIP();
  IPAddress myIP = WiFi.localIP();
  Pdisplay.showNumberDec(WiFi.localIP()[2]*1000+WiFi.localIP()[3],false);
	Serial.print("IP address: ");
	Serial.println(myIP);
	server.on("/", handleRoot);
  server.on("/RawData", handleRawData);
  server.on("/RawDataOnly", handleRawDataOnly);
  server.on("/Data", handleData);
  server.onNotFound(handleNotFound);


 
	server.begin();
	Serial.println("HTTP server started");
}

void loop() {
	server.handleClient();

  if (millis()-time1>timedelay*1000){//perform ana ftion every "timedelay" # of seconds
    if (WiFi.status() == WL_CONNECTED) {
    Pdisplay.showNumberDec(WiFi.localIP()[2]*1000+WiFi.localIP()[3],false);
  }
  else Pdisplay.showNumberDec(0,false);
    
    time1=millis();
    //int  dataMode=2;
    //getdata(numsensors);
    }
  
}




void checkvoltage(){
  
//  check for an overvoltage situation
  getValues(); //will need to change the pin number and conversion factor later
  float maxVal=0;
  for (int i=0;i<6;i++){
    if (maxVal<values[i]){maxVal=values[i];}}
  if (maxVal>threshold2){
    analogWrite(pinPWM,1);
    }
  else if (maxVal>threshold1){
    int value = ((maxVal-threshold1)*1023)/(threshold2-threshold1);
    analogWrite(pinPWM,value);
    
    }
  else if(maxVal<threshold1){
    analogWrite(pinPWM,0);
    }
  }

void handleRawDataOnly(){
  returnString="";
  getdata(numsensors);
  
  for (int i=0;i<numsensors;i++){
    
    returnString+=String(data[i])+"\n";
    
    }
  
  server.sendHeader("Access-Control-Allow-Origin", "*");//should be included automatically, acording to documentation, but isn't for some reason  
  server.send(200, "text/plain", returnString);
}


void handleRawData(){
  time1=millis();
 
  returnString="";
  getdata(numsensors);

  for (int i=0;i<numsensors;i++){
    returnString+="Sensor" + String(i) + " = ";
    returnString+=String(data[i])+"\n";
    
  }

  server.sendHeader("Access-Control-Allow-Origin", "*");//should be included automatically, acording to documentation, but isn't for some reason
  server.send(200, "text/plain", returnString);
}


void getValues(){
getdata(numsensors);
convertValues();
}

void convertValues(){
int i;
  for (i=0;i<6;i++){
    values[i]=convertV(data[i]);
    
    values[i+6]=convertI(data[i+6],i);
    }
  
  
  }

float convertV(float value){
  value=value/20;
  if (value<0.5){value=0;}

  return value;
}


float convertI(float value,int pin){
  //int currzero[6]={504,506,502,507,506,496};//not all sensors are the same, this array accounts for the slight differences in central voltage.
  //these voltages are also dependent on the supply voltage, which may change. grr. have to accept that for now
  int currzero[6]={589,606,607,575,612,596};
  value=currzero[pin]-value;
  value=value*0.037;
  if (value<0.2) {value=0;}
  return value; //converted to actual current
}

void setdisplay(){

  float voltage=0;
  float power=0;
  for (int i=0; i<6; i++){
    if (voltage>convertV(data[i])){voltage=convertV(data[i]);} //get maximum voltage
    power+=convertV(data[i])*convertV(data[6+i]); //sum total power
    }
     
    //Vdisplay.showNumberDec(voltage, false);//need to set the formatting correctly, currently probably only uses last two didgets
    //Pdisplay.showNumberDec(power, false);//need to set the formatting correctly, currently probably only uses last two/three didgets. are decimals possible?
  
 // Doesn't need to be a response to anything! 
 // server.sendHeader("Access-Control-Allow-Origin", "*");//should be included automatically, acording to documentation, but isn't for some reason
 // server.send(200, "text/plain", returnString);

}

void handleData(){
  time1=millis();
  returnString="";
  getValues();
  
  for (int i=0;i<6;i++){
    returnString+="Voltage " +String(i)+": ";
    returnString+=String(values[i])+"\n";
    
    }
  
  for (int i=6;i<12;i++){
    
    returnString+="Current " +String(i-6)+": ";
    returnString+=String(values[i])+"\n";
    
    }
  server.sendHeader("Access-Control-Allow-Origin", "*");//should be included automatically, acording to documentation, but isn't for some reason
  server.send(200, "text/plain", returnString);

}

void handleDataOnly(){
  time1=millis();
  returnString="";
  server.sendHeader("Access-Control-Allow-Origin", "*");//should be included automatically, acording to documentation, but isn't for some reason
  server.send(200, "text/plain", returnString);
}


void handleDataLog(){
  returnString="Temperature Logs:\n";
  returnString+="T1,    T2,    T3,    T4,    T5,   time\n";
   for (int j=0;j<totalPoints;j++){
     for (int i=0;i<numsensors+1;i++){
       returnString+=String(dataLog[i][j])+", ";
  }
  returnString+="\n";
  }
  server.sendHeader("Access-Control-Allow-Origin", "*");//should be included automatically, acording to documentation, but isn't for some reason
  server.send(200, "text/plain", returnString);
}


int getdata(int pin){

  if (pin>0 & pin <numsensors){//gets data for chosen sensor

  digitalWrite(pinEN,0);
  digitalWrite(pinS0,((pin))%2);
  digitalWrite(pinS1,((pin/2))%2);
  digitalWrite(pinS2,((pin/4))%2);
  digitalWrite(pinS3,((pin/8))%2);
  delay(4);//to stop leakage from previous measurement
  int value=analogRead(pinAna);
  return value;
    }
  else if (pin==numsensors){//writes data from all sensors into data array
  for (pin=0;pin<numsensors;pin++){
  digitalWrite(pinEN,0);
  digitalWrite(pinS0,((pin))%2);
  digitalWrite(pinS1,((pin/2))%2);
  digitalWrite(pinS2,((pin/4))%2);
  digitalWrite(pinS3,((pin/8))%2);
  //digitalWrite(pinEN,0);
  delay(4);//to stop leakage from previous measurement
  data[pin]=analogRead(pinAna);
  
  }
  return numsensors; //code to say successfully wrote data[]
  }

  return 0; //error code to say nothing happened
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

