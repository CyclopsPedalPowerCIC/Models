/*
  continuing from V10, which appears to work as far as I can tell! 
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
aDevice control1;
aDevice control2;
aDevice control3;
aDevice control4;
aDevice control5;
aDevice control6;
aDevice espData;

#define LED_PIN 4
#define NUM_LEDS 60
#define NUM_SOCKETS 64
#define OneWirePin 3
#define Clock595 5
#define Data595  7
#define Latch595 6
#define Brightness 170

  CRGB leds[NUM_LEDS];
  OneWire  plugs(OneWirePin);

//bool lightMap[54];
int socketMap[64]={0,1,2,3,4,5,8,9,10,11,12,13,16,17,18,19,20,21,24,25,26,27,28,29,32,33,34,35,36,37,40,41,42,43,44,45,48,49,50,51,52,53,56,57,58,59,60,61,6,7,14,15,22,23,30,31,38,39,46,47,54,55,62,63};
byte socketaddress[2][NUM_SOCKETS];  
int unq1=2;  //most of the address bytes are identical, these two ahave the most variation so are used
int unq2=7;  //unique address parts that are saved to check with device is conected

int linkList[42]; //how controls are linked to the sockets (70-80 are lights) 0-6 control 1, 7-13 control2 etc etc

int devicesocket[NUM_SOCKETS]; 
int socketstate[NUM_SOCKETS]; //0 empty /1 on 2 off

int lights[] = {4,4,12,6,4,4,8,8,0,0};  //order: lounge,dining,kitchen,bath,hall,bed3,bed2,bed1, (loft, not yet)(lounge shold be 8 but had to remove one dodgy set

int Skitchen=0;  //mapping which socket block goes first
int Sdining =1;
int Slounge =2;
int Sbed1   =3;
int Sbed2   =4;
int Sbed3   =5;
int Sbath   =6;
int Sloft   =7;




// create shift register object (number of shift registers, data pin, clock pin, latch pin)
// ser=data =pin 14, clock=pin 11 latch=pin12, pin 13 low, pin 10 clear, set high to not clear
ShiftRegister74HC595 sockets (NUM_SOCKETS, Data595, Clock595, Latch595); 

 
void setup() {

linkList[0]=70;
linkList[1]=71;
linkList[2]=72;
linkList[3]=73;
linkList[4]=74;
linkList[5]=75;
linkList[6]=76;
linkList[28]=77;

   
   Serial.begin(115200);  // a requirement since all uses serial
   Serial.println(F("version="));
   Serial.println(F(__FILE__));
   Serial.println(F("\nDate="));
   Serial.println(F(__DATE__));
   espData=comms.newDevice('T','E');
   control1=comms.newDevice('T','T');
   control2=comms.newDevice('T','R');
   control3=comms.newDevice('T','S');
   control4=comms.newDevice('T','U');
   control5=comms.newDevice('T','P');
   control6=comms.newDevice('T','Q');
   FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);  //notice flickering, several possibel issues, but probably a timing issue. leaving it for now. **fixed by not using an ESP!
  //FastLED.addLeds<WS2811, LED_PIN, GRB>(leds, NUM_LEDS);  //notice flickering, several possibel issues, but probably a timing issue. leaving it for now. **fixed by not using an ESP!


   for (int i=0;i<NUM_LEDS;i++){
   leds[i]=CRGB(0,0,255);
   }
   FastLED.show();

  for (int i=0;i<NUM_SOCKETS;i++){
    socketstate[i]=0;
  for (int j=0;j<1;j++){
   socketaddress[j][i]=0;
   }}
  
  //sockets.setAllHigh();  //turn them all on...
  
  delay(1000);
  
  sockets.setAllHigh();  //turn them all on...
  //delay(1000);
  //clearSockets();
  checkSockets();   //check what is plugged in
  basicFind();   //check where it is plugged in
}


void loop() {
  comms.sendRequest(&control1,'S','?',&set1);
  comms.sendRequest(&control2,'S','?',&set2);
  comms.sendRequest(&control3,'S','?',&set3);
  comms.sendRequest(&control4,'S','?',&set4);
  comms.sendRequest(&control5,'S','?',&set5);
  comms.sendRequest(&control6,'S','?',&set6);
  comms.sendRequest(&espData,'M','?',&changeLinks);
  sendDataESP();
  
  //Serial.print("loop");
  //delay(50);
  //comms.check();
  delay(50);
  comms.check();

  //sockets.setAllHigh();  //turn them all on...
  //delay(1);
  //Serial.print(checkSockets());   //check what is plugged in
  //checkSockets();
   //basicFind();

}

void set1(){
  
  for (int j=0;j<7;j++){
    if ((control1.returnString[j]-'0')==1){
       setDevice(linkList[j],1);
    }
    else if (((control1.returnString[j]-'0'))==0){
       setDevice(linkList[j],0);
    }
  
  }
  sockets.updateRegisters();
  FastLED.show(); 
  delay(50);
  }
void set2(){
  
  for (int j=0;j<7;j++){
    if ((control2.returnString[j]-'0')==1){
       setDevice(linkList[7+j],1);
    }
    else if (((control2.returnString[j]-'0'))==0){
       setDevice(linkList[7+j],0);
    }
  
  }
  sockets.updateRegisters();
  FastLED.show(); 
  delay(50);
  
  }
void set3(){
for (int j=0;j<7;j++){
    if (((control3.returnString[j]-'0'))==1){
       setDevice(linkList[14+j],1);
    }
    else if (((control3.returnString[j]-'0'))==0){
       setDevice(linkList[14+j],0);
    }
  
  }
  sockets.updateRegisters();
  FastLED.show(); 
  delay(50);
  
  }
void set4(){
  for (int j=0;j<7;j++){
    if (((control4.returnString[j]-'0'))==1){
       setDevice(linkList[21+j],1);
    }
    else if (((control4.returnString[j]-'0'))==0){
       setDevice(linkList[21+j],0);
    }
  
  }
  sockets.updateRegisters();
  FastLED.show(); 
  delay(50);
  
  }
void set5(){
  for (int j=0;j<7;j++){
    if (((control5.returnString[j]-'0'))==1){
       setDevice(linkList[28+j],1);
    }
    else if (((control5.returnString[j]-'0'))==0){
       setDevice(linkList[28+j],0);
    }
  
  }
  sockets.updateRegisters();
  FastLED.show(); 
  delay(50);
  }
void set6(){
  for (int j=0;j<7;j++){
    if (((control6.returnString[j]-'0'))==1){
       setDevice(linkList[35+j],1);
       
    }
    else if (((control6.returnString[j]-'0'))==0){
       setDevice(linkList[35+j],0);
       //socketstate[linkList[35+j]]=2;
    }
  
  }
  sockets.updateRegisters();
  FastLED.show(); 
  delay(50);
  }

void setDevice(int device,int state){
  int Xdevice;
  if ((device>-1)&&(device<NUM_SOCKETS)){
    sockets.setNoUpdate(device, state);
    for (int i=0;i<64;i++){if (device==devicesocket[i]){Xdevice=i;}}
    if (state==1) {socketstate[Xdevice]=1;}
    else if (state==0) {socketstate[Xdevice]=2;}
  }
  else if ((device>69)&&(device<80)){setRoom(device-70,state*Brightness); return;}
  }

  
void changeLinks(){ //run when data comes back from the esp comms
  
int dataLeft=int((espData.returnString[0]-'0'))*10+int((espData.returnString[1]-'0'));
int sNum;
int sState;
int sLink;
//Serial.print(F("upd-links1"));

if (dataLeft>0){

  for (int i=0;i<42;i++){Serial.print(linkList[i]);}
  Serial.print('\n');
  //Serial.print(F("upd-links2"));
  sNum=int((espData.returnString[2]-'0'))*10+int((espData.returnString[3]-'0'));  //which socket number
  sState=int((espData.returnString[4]-'0'))*100+int((espData.returnString[5]-'0')*10)+int((espData.returnString[6]-'0'));//what state to set
  sLink=int((espData.returnString[7]-'0'))*10+int((espData.returnString[8]-'0')*1);//which control the socket links to

  if (sLink==99){checkSockets(); basicFind(); return;}
  
  linkList[sLink]=sNum;
  setCState(sLink,sState);

  if (dataLeft>1){
    comms.sendRequest(&espData,'M','?',&changeLinks);}
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

  

int checkSockets(){
  
   byte addr[8];
   //Serial.println("Checking sockets!");
   for (int i=0;i<NUM_SOCKETS;i++){socketstate[i]=socketstate[i]+10;}//to keep track of whther they are still there
   int sNum=0;
   
   while ( plugs.search(addr)) {
    int found=0;
    sNum++;

    for(int j=0;j<NUM_SOCKETS;j++){
    if ((socketaddress[0][j]==addr[unq1])&&(socketaddress[1][j]=addr[unq2])){
      socketstate[j]=socketstate[j]-10;  //set the socket location
      found=1;
      break;  //done the job of this loop, break out
      }
    } 
    
    if (found==0){
    newDevice(sNum);
    socketaddress[0][sNum]=addr[unq1];
    socketaddress[1][sNum]=addr[unq2]; //save where the device is
    }
  }
  for (int i=0;i<NUM_SOCKETS;i++){if (socketstate[i]>9){removeSocket(i);} }//only true if it wasn't seen during sweep, and therefore removed
   
  
  //Serial.print("At location: ");
  return(findSocket(addr));
  
  plugs.reset_search();
  
  }

void removeSocket(int sNum){
  socketstate[sNum]=0;
  socketaddress[0][sNum]=0;
  socketaddress[1][sNum]=0;
  }

void basicFind(){
  byte addr[8];
  for(int i=0;i<NUM_SOCKETS;i++){
    socketSetEmpty(i, 1);  //sets all sockets off except the one we want
    delay(1);
  while ( plugs.search(addr)) {
    
  for(int j=0;j<NUM_SOCKETS;j++){
    if ((socketaddress[0][j]==addr[unq1])&&(socketaddress[1][j]=addr[unq2])){
      devicesocket[j]=i;  //set the socket location
      break;  //done the job of this loop, break out
      }
    } 
  }
    
    
    
    }
  }

void clearSockets(){
  
  for(int j=0;j<NUM_SOCKETS;j++){
  socketaddress[0][j]=0;
  socketaddress[1][j]=0;
  socketstate[j]=0;
  }
}

int findSocket(byte addr[8]){

   for (int i=0;i<NUM_SOCKETS;i++){//check if already known location
    if (socketaddress[0][i]==addr[unq1]&&socketaddress[1][i]==addr[unq2]){
      return(i);}
      }

   byte addr2[8];
   int dummyvar=1;

   //if got this far then its a new plug in a socket, lets find it!
   byte location[6]={0,0,0,0,0,0};

   int lowerbound=0;  //lowest known socket where it can be
   for (int i=0;i<6;i++){
   
    socketSetEmpty(lowerbound,pow2(5-i));
    
   delay(1); //may not even be needed?
   dummyvar=0;
   while ( plugs.search(addr2)&&(dummyvar>0)) {
    if ((addr2[unq1]==addr[unq1])&&(addr2[unq2]==addr[unq2])){dummyvar=1;}
    }
    if (dummyvar==1){
      location[i]=0;
      }
    else{ //is was not found, lets check if it is in second half
    lowerbound+=pow2(5-i);  
    //Serial.print("lb:");
    //Serial.println(lowerbound);  
    
      socketSetEmpty(lowerbound,pow2(5-i));
      
     delay(1);
     dummyvar=0;
   while ( plugs.search(addr2)&&dummyvar>0) {
    if ((addr2[unq1]==addr[unq1])&&(addr2[unq2]==addr[unq2])){dummyvar=1;}
    }
    if (dummyvar==1){
      location[i]=1;
      }
      else{ //is was not found in either half, error!
      return(-1); 
     }  
     }
   }
  socketaddress[0][lowerbound]=addr[unq1];
  socketaddress[1][lowerbound]=addr[unq2]; //save where the device is
    
  newDevice(lowerbound);  //not written yet
  return(lowerbound);
    
  } 

void newDevice(int sNum){
  
socketstate[sNum]=1;  //register the device as on
devicesocket[sNum]=99;  //set socket as unknown
  //do some more stuff?
  }

int pow2(int p){
    return 1 << p;
}





void sendDataESP(){
  //sends current data of the house to the esp
int numLights=10;

int iterLights=0;
  bool stateL[numLights];
  for (int i=0;i<numLights;i++){
  stateL[i]=leds[iterLights][0];//probably wrong cintax, need to extract a component of the light
  iterLights+=lights[i]; //calculates the lights before this set in the chain
  }

int outByte1 = 0;
int outByte2 = 0;
for(int i=0; i<8; i++){
   outByte1 |= stateL[i] << i;
}
for(int i=0; i<numLights-8; i++){
   outByte2 |= stateL[i+8] << i;
}

int numberDevices=0;
  for (int i=0;i<NUM_SOCKETS;i++){
    if (socketstate[i]!=0){numberDevices++;}
  }
  int numMessages=numberDevices;
  
  char nM='0'+numMessages;
  //comms.sendRequest(&control1,'D',nM);  //where nM is the number of messages to be sent

  Serial.print(F("aTEM0?D"));//first message saying how many messages coming and lights data
  Serial.print(char(nM));  //incoming messages
  Serial.print(char(outByte1));
  Serial.print(char(outByte2));//sends unintelligable char to be decoded
  Serial.println(F("--"));  //filler

  for (int i=1;i<=numMessages;i++){//message for each connected device
    int j=0;
    numberDevices=0;
    while ((numberDevices)<i){if (socketstate[j]!=0){numberDevices++;} j++;}
  Serial.print(F("aTEM"));
  Serial.print(char(('0'+i)));
  Serial.print(F("?D"));
  Serial.print(char(('0'+socketstate[j-1])));
  if (devicesocket[j-1]<10){Serial.print('0');}
  Serial.print(devicesocket[j-1]);
  Serial.print(char(socketaddress[0][j-1]));
  Serial.print(char(socketaddress[1][j-1]));
  Serial.println("");
  }
  }

void socketSetEmpty(int low, int number){//turn on only the selected sockets that are not connected to anything else 

int i;

for (i=0;i<(low);i++){
  if (socketstate[i]==0){
    sockets.setNoUpdate(i, 0);
  }
}
for (int i=low;i<(low+number);i++){
  if (socketstate[i]==0){
    sockets.setNoUpdate(i, 1);
  }
}
for (int i=(low+number);i<NUM_SOCKETS;i++){
  if (socketstate[i]==0){
    sockets.setNoUpdate(i, 0);
  }
}
   sockets.updateRegisters();
//  setNoUpdate(pin, value);
//  updateRegisters();
  
  }

void setRoom(int room,int bright){

  int  start=0;
  for (int j=0;j<room;j++){start+=lights[j];} //calculate lights before this set in the chain
  
  for (int k=0;k<lights[room];k++){leds[start+k]=CRGB(bright,bright,bright);}
  
  
  }



void socketSet(int pin, bool data){
    sockets.set(socketMap[pin],data);
  }
  

void socketBlockSet(int block,int pin,bool data){
    sockets.set(socketMap[pin+block*6],data);
  }
  

void socketBlockSetA(int block, bool data){
  for (int i=0;i<6;i++){
    sockets.set(socketMap[i+block*6],data);
  }
  }
