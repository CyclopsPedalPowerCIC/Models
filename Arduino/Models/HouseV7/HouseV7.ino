/*
  same as V3 but now setup for a nanp rather than an esp to run it. Now needs comms to the esp adding into it
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
aDevice ESPcomms;

#define LED_PIN 4
#define NUM_LEDS 60
#define NUM_SOCKETS 64
#define OneWirePin 3
#define Clock595 5
#define Data595  7
#define Latch595 6

  CRGB leds[NUM_LEDS];
  OneWire  plugs(OneWirePin);

//bool lightMap[54];
int socketMap[64]={0,1,2,3,4,5,8,9,10,11,12,13,16,17,18,19,20,21,24,25,26,27,28,29,32,33,34,35,36,37,40,41,42,43,44,45,48,49,50,51,52,53,56,57,58,59,60,61,6,7,14,15,22,23,30,31,38,39,46,47,54,55,62,63};
byte socketaddress[2][NUM_SOCKETS];  
int unq1=2;  //most of the address bytes are identical, these two ahave the most variation so are used
int unq2=7;  //unique address parts that are saved to check with device is conected

int socketstate[NUM_SOCKETS]; //0 empty /1 on 2 off

int lights[] = {8,4,12,6,4,4,8,8,1,1};  //order: lounge,dining,kitchen,bath,hall,bed3,bed2,bed1, (loft, not yet) (1's are spare)


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
   
   Serial.begin(115200);  // a requirement since all uses serial
   Serial.println("Hi!");
   control1=comms.newDevice('T','T');
   control1=comms.newDevice('T','E');
   FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);  //notice flickering, several possibel issues, but probably a timing issue. leaving it for now. **fixed by not using an ESP!


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
  checkSockets();   //check what is plugged in
}

int checkSockets(){

  

   byte addr[8];
   //Serial.println("Checking sockets!");
   for (int i=0;i<NUM_SOCKETS;i++){socketstate[i]=socketstate[i]*4;}//to keep track of whther they are still there
   int sNum=0;
   
   while ( plugs.search(addr)) {
    Serial.println("Address:");
    for(int i = 0; i < 8; i++) {
    Serial.print(addr[i], HEX);
    Serial.print(" ");
    }
    Serial.println("");
    sNum=findSocket(addr);
    if ((socketstate[sNum]==4)||(socketstate[sNum]==8)){socketstate[sNum]=socketstate[sNum]/4;}
  }
  for (int i=0;i<NUM_SOCKETS;i++){if ((socketstate[i]==4)||(socketstate[i]==8)){removeSocket(i);}}//only true if it wasn't seen during sweep, and therefore removed
   
  
  //Serial.print("At location: ");
  return(findSocket(addr));
  
  plugs.reset_search();
  
  }

void removeSocket(int sNum){
  
  socketstate[sNum]=0;
  }

  
void sendDataESP(){
  //sends current data of the house to the esp

  for (int i=0;i<lights.length;i++){
  bool state[]={0,0,0,0,0,0,0,0,0,0};
  int  start=0; //calculate
  for (int j=0;j<room;j++){start+=lights[j];} //calculate lights before this set in the chain
  }
  int numMessages=5;
  char nM='0'+numMessages;
  comms.sendRequest(&control1,'D',nM);  //where nM is the number of messages to be sent

  for (int i=0;i<numMessages;i++){
  Serial.print("aTES");
  Serial.print(('1'+i));
  Serial.print("#s#s");

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
  //do some more stuff?
  }

int pow2(int p){
    return 1 << p;
}

void setLights(){
  //control1.returnString

  for (int j=1;j<8;j++){
    
    setRoom(j,(bool(control1.returnString[j-1]-'0'))*255);
  
  }

  FastLED.show();  
  delay(50);
  }




int k=0;



void loop() {
  comms.sendRequest(&control1,'S','?',&setLights);
  delay(50);
  comms.check();
delay(500);

//comms.check();

//sockets.setAllHigh();  //turn them all on...
 // delay(1);
 // Serial.print(checkSockets());   //check what is plugged in
k=(k+50)%256;

for (int cat=0;cat<64;cat=cat+1){
    
  leds[cat]=CRGB(255-4*cat,k,4*cat);
  
  FastLED.show();
  delay(50);
  }

  
//
  FastLED.show();  
  
  
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
