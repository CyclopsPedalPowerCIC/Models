/*
  continuing from V12, checking how the socket coding is working (or not!)
*/
//pins: lights D0, oneWire D1 595's D5-D7 serial on serial pins etc etc
//
//
//
//

#include <ShiftRegister74HC595.h>
#include "FastLED.h"
#include <OneWire.h>


#include "aMaster.h"
aComms comms;
aDevice control[6];
aDevice espData;

#define LED_PIN 4
#define NUM_LEDS 60
#define NUM_SOCKETS 64
#define OneWirePin 3
#define Clock595 5
#define Data595  7
#define Latch595 6
#define Brightness 170
#define NOT_LINKED 40

  CRGB leds[NUM_LEDS];
  OneWire  plugs(OneWirePin);

byte socketAddress[2][NUM_SOCKETS];  
int unq1=2;  //most of the address bytes are identical, these two ahave the most variation so are used
int unq2=7;  //unique address parts that are saved to check with device is conected

//int linkList[42]; //how controls are linked to the sockets (70-80 are lights) 0-6 control 1, 7-13 control2 etc etc
int linkList[80]; //now reversed, so each socket has a value as to which control controls it including lights, state 99 means not connected

int controlState[41]; //plus 38 always on, 39 always off, 40 (=NOT_LINKED) not connected to anything
//int devicesocket[NUM_SOCKETS]; 
//int socketstate[NUM_SOCKETS]; //0 empty /1 on 2 off

int lights[] = {4,4,12,6,4,4,8,8,0,0};  //order: lounge,dining,kitchen,bath,hall,bed3,bed2,bed1, (loft, not yet)(lounge shold be 8 but had to remove one dodgy set

int Skitchen=0;  //mapping which socket block goes first
int Sdining =1;
int Slounge =2;
int Sbed1   =3;
int Sbed2   =4;
int Sbed3   =5;
int Sbath   =6;
int Sloft   =7;

long loopTimer=millis();



// create shift register object (number of shift registers, data pin, clock pin, latch pin)
// ser=data =pin 14, clock=pin 11 latch=pin12, pin 13 low, pin 10 clear, set high to not clear
ShiftRegister74HC595 sockets (NUM_SOCKETS, Data595, Clock595, Latch595); 

 
void setup() {

for (int i=0;i<80;i++){
  linkList[i]==NOT_LINKED;  //set all to disconnected
}
for (int i=0;i<40;i++){
  controlState[i]==0;  //set all to disconnected
}
for (int i=0;i<NUM_SOCKETS;i++){
  for (int j=0;j<1;j++){
    socketAddress[j][i]=0;
}}

linkList[70]=0;
linkList[71]=1;
linkList[72]=2;
linkList[73]=3;
linkList[74]=4;
linkList[75]=5;
linkList[76]=6;
linkList[77]=28;  //link up the lights at the beginning...



   
   Serial.begin(115200);  // a requirement since all uses serial
   Serial.println(F("version="));
   Serial.println(F(__FILE__));
   Serial.println(F("\nDate="));
   Serial.println(F(__DATE__));
   espData=comms.newDevice('T','E');
   control[0]=comms.newDevice('T','T');
   control[1]=comms.newDevice('T','R');
   control[2]=comms.newDevice('T','S');
   control[3]=comms.newDevice('T','U');
   control[4]=comms.newDevice('T','P');
   control[5]=comms.newDevice('T','Q');
   FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);  //notice flickering, several possibel issues, but probably a timing issue. leaving it for now. **fixed by not using an ESP!
  //FastLED.addLeds<WS2811, LED_PIN, GRB>(leds, NUM_LEDS);  //notice flickering, several possibel issues, but probably a timing issue. leaving it for now. **fixed by not using an ESP!


   for (int i=0;i<NUM_LEDS;i++){
   leds[i]=CRGB(0,0,255);
   }
   FastLED.show();



  controlState[38]=1;
  controlState[39]=0;
  
  delay(1000);
  
  basicFind();   //check where it is plugged in
}


void loop() {
  comms.sendRequest(&control[0],'S','?',&setCon);  //sedn request
  delay(1); //delay to reduce messages colliding
  comms.check();  //check if message has been recieved
  comms.sendRequest(&control[1],'S','?',&setCon);
  delay(1);
  comms.check();
  comms.sendRequest(&control[2],'S','?',&setCon);
  delay(1);
  comms.check();
  comms.sendRequest(&control[3],'S','?',&setCon);
  delay(1);
  comms.check();
  comms.sendRequest(&control[4],'S','?',&setCon);
  delay(1);
  comms.check();
  comms.sendRequest(&control[5],'S','?',&setCon);
  delay(1);
  comms.check();
  comms.sendRequest(&espData,'M','?',&changeLinks);
  delay(1);
  comms.check();
  sendDataESP();
  
  //Serial.print("loop");
 delay(40);  //delay beacuse this loop doesn't need to happen at lightning speed, may cause comms issues if it does, maybe? dunno
  //comms.check();
  
  comms.check();

  //sockets.setAllHigh();  //turn them all on...
  //delay(1);
  //Serial.print(checkSockets());   //check what is plugged in
  //checkSockets();

  if (millis()-loopTimer<0){ //dont do this for now, it's annoying!
  basicFind();   //also sets all of the data for the sockets  this line slows doesn everything else, and lights up sockets, only run every x times?
  loopTimer=millis();
  }
}

void setCon(){

  for (int i=0;i<6;i++){
  for (int j=0;j<7;j++){
    if ((control[i].returnString[j]-'0')==1){
       controlState[7*i+j]=1;
    }
    else if (((control[i].returnString[j]-'0'))==0){
       controlState[7*i+j]=0;
    }
  }
  }
  updateSockets();
  }
 
void updateSockets(){

  for (int i=0;i<NUM_SOCKETS;i++){
    if (linkList[i]==NOT_LINKED){sockets.setNoUpdate(i,0);}
    else {
    sockets.setNoUpdate(i, controlState[linkList[i]]);}
    }

  for (int i=0;i<10;i++){
    setRoom(i,controlState[linkList[70+i]]*Brightness);
    }
  sockets.updateRegisters();
  FastLED.show(); 
  delay(50);
  }


  
void changeLinks(){ //run when data comes back from the esp comms
  
  int dataLeft=int((espData.returnString[0]-'0'))*10+int((espData.returnString[1]-'0'));
  int sNum;
  int sState;
  int sLink;

if (dataLeft>0){

  //for (int i=0;i<80;i++){
  //Serial.print(linkList[i]);}
  //Serial.print('\n');

  sNum=int((espData.returnString[2]-'0'))*10+int((espData.returnString[3]-'0'));  //which socket number
  sState=int((espData.returnString[4]-'0'))*100+int((espData.returnString[5]-'0')*10)+int((espData.returnString[6]-'0'));//what state to set
  sLink=int((espData.returnString[7]-'0'))*10+int((espData.returnString[8]-'0')*1);//which control the socket links to

  if (sLink==99){basicFind(); return;}
  
  linkList[sNum]=sLink;
  setCState(sLink,sState);

  if (dataLeft>1){
    comms.sendRequest(&espData,'M','?',&changeLinks);}  //theres more data to get, rerun this until its done
  }
}

void setCState(int sLink,int sState){//sends a command to the control boards to set pin properties
  
  if ((sLink>-1)&&(sLink<7)){Serial.print(F("aTTMD"));}
  else if ((sLink>6)&&(sLink<14)){Serial.print(F("aTRMD"));}
  else if ((sLink>13)&&(sLink<21)){Serial.print(F("aTSMD"));}
  else if ((sLink>20)&&(sLink<28)){Serial.print(F("aTUMD"));}
  else if ((sLink>27)&&(sLink<35)){Serial.print(F("aTPMD"));}
  else if ((sLink>34)&&(sLink<42)){Serial.print(F("aTQMD"));}
  else {return;} //if failed thse conditions then something is wrong!

  if ((sState>-1)&&(sState<5)){
  Serial.print("?M");  //normal mode, set mode
  Serial.print((sLink%7));
  Serial.print(sState);
  Serial.print(F("---\n"));
  }
  else if (sState>4) {
     Serial.print("?T");  //timed mode, set timer: Mode will set automatically
     Serial.print((sLink%7));
     if (sState<1000) Serial.print('0');
     if (sState<100) Serial.print('0');
     if (sState<10) Serial.print('0');
     Serial.print((sState-5));
    }
  }


void basicFind(){
  byte addr[8];
  int j=0;
  for(int i=0;i<NUM_SOCKETS;i++){
    //j=0;
    socketSetEmpty(i, 1);  //sets all sockets off except the one we want
    //delay(1);
    delayMicroseconds(100); //needs to be long enough to power the sensor
  if (plugs.search(addr)) {
    Serial.print(i);
    Serial.print(" ");
    Serial.print(j);
    Serial.print("\n");
   //j++; 
   socketAddress[0][i]=addr[unq1];
   socketAddress[1][i]=addr[unq2];
   if (linkList[i]==NOT_LINKED){linkList[i]=39;}  //set to always off to start with
  }
  else{
   socketAddress[0][i]=0;
   socketAddress[1][i]=0;
   linkList[i]=NOT_LINKED;   
    }
   //plugs.reset_search();
   plugs.reset();
  }
  updateSockets();  //to undo the turning on/off all of the sockets
}

void clearSockets(){  
  
  for(int j=0;j<NUM_SOCKETS;j++){
  socketAddress[0][j]=0;
  socketAddress[1][j]=0;
//  socketstate[j]=0;
  }
}

int pow2(int p){
    return 1 << p;
}





void sendDataESP(){
  //sends current data of the house to the esp
int numLights=10;


int outByte1 = 0;
int outByte2 = 0;
for(int i=0; i<8; i++){
   outByte1 |= bool(controlState[linkList[70+i]]) << i;
}
for(int i=0; i<numLights-8; i++){
   outByte2 |= bool(controlState[linkList[78+i]]) << i;
}

int numberDevices=0;
  for (int i=0;i<NUM_SOCKETS;i++){
    if ((socketAddress[0][i]!=0)&&(socketAddress[1][i]!=0)){numberDevices++;
    //add printing out code here beacuse it makes more sense
    }  
  }
  int numMessages=numberDevices;
  
  char nM='0'+numMessages;
  //comms.sendRequest(&control1,'D',nM);  //where nM is the number of messages to be sent

  Serial.print(F("aTEM0?D"));//first message saying how many messages coming and lights data
  Serial.print(char(nM));  //incoming messages
  Serial.print(char(outByte1));
  Serial.print(char(outByte2));//sends humanly unintelligable chars to be decoded
  Serial.println(F("--"));  //filler

int j=0;
for (int i=0;i<NUM_SOCKETS;i++){
    if ((socketAddress[0][i]!=0)&&(socketAddress[1][i]!=0)){//message for each connected device
    j++;
    
  Serial.print(F("aTEM"));
  Serial.print(char(('0'+j)));
  Serial.print(F("?D"));
  Serial.print(char(('0'+controlState[linkList[i]])));
  if (i<10){Serial.print('0');}
  Serial.print(i);
  Serial.print(char(socketAddress[0][i]));
  Serial.print(char(socketAddress[1][i]));
  Serial.println("");
  }
  }
}

void socketSetEmptyI(int low, int number){//turn on only the selected sockets that are not connected to anything else 

int i;

for (i=0;i<(low);i++){
  if (controlState[linkList[i]]==NOT_LINKED){
    sockets.setNoUpdate(i, 0);
  }
}
for (int i=low;i<(low+number);i++){
  if (controlState[linkList[i]]==NOT_LINKED){
    sockets.setNoUpdate(i, 1);
  }
}
for (int i=(low+number);i<NUM_SOCKETS;i++){
  if (controlState[linkList[i]]==NOT_LINKED){
    sockets.setNoUpdate(i, 0);
  }
}
   sockets.updateRegisters();

  
  }

  void socketSetEmpty(int low, int number){//turn on only the selected sockets 

int i;

for (i=0;i<(low);i++){
    sockets.setNoUpdate(i, 0);
}
for (i=low;i<(low+number);i++){
    sockets.setNoUpdate(i, 1);
}
for (i=(low+number);i<NUM_SOCKETS;i++){
    sockets.setNoUpdate(i, 0);
}
   sockets.updateRegisters();
}

void setRoom(int room,int bright){

  int  start=0;
  for (int j=0;j<room;j++){start+=lights[j];} //calculate lights before this set in the chain
  
  for (int k=0;k<lights[room];k++){leds[start+k]=CRGB(bright,bright,bright);}

  }
  
