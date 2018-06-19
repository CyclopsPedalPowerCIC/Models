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

#define LED_PIN 4
#define NUM_LEDS 60
#define OneWirePin 3
#define Clock595 5
#define Data595  7
#define Latch595 6

  CRGB leds[NUM_LEDS];
  OneWire  plugs(OneWirePin);

//bool lightMap[54];
int socketMap[64]={0,1,2,3,4,5,8,9,10,11,12,13,16,17,18,19,20,21,24,25,26,27,28,29,32,33,34,35,36,37,40,41,42,43,44,45,48,49,50,51,52,53,56,57,58,59,60,61,6,7,14,15,22,23,30,31,38,39,46,47,54,55,62,63};
byte socketaddress[2][64];
int socketstate[64]; //0 empty /1 on 2 off

int lights[] = {8,4,12,6,4,4,8,8};  //order: lounge,dining,kitchen,bath,hall,bed3,bed2,bed1, (loft, not yet)

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
ShiftRegister74HC595 sockets (64, Data595, Clock595, Latch595); 

 
void setup() {
   
   Serial.begin(115200);  // a requirement since all uses serial
   Serial.println("Starting!  hi");
   control1=comms.newDevice('T','T');
   FastLED.addLeds<WS2812B, LED_PIN, GRB>(leds, NUM_LEDS);  //notice flickering, several possibel issues, but probably a timing issue. leaving it for now.
   //FastLED.addLeds<WS2811, LED_PIN, GRB>(leds, NUM_LEDS);  //less flickering?, maybe not exactly what I was sold?

   for (int i=0;i<NUM_LEDS;i++){
   leds[i]=CRGB(0,0,255);
   }
   FastLED.show();

  for (int i=0;i<64;i++){
    socketstate[i]=0;
  for (int j=5;j<6;j++){
   socketaddress[j][i]=0;
   }}
  
  //sockets.setAllHigh();  //turn them all on...
  
  delay(1000);
  
  sockets.setAllHigh();  //turn them all on...
  //delay(1000);
  checkSockets();   //check what is plugged in
}

void checkSockets(){

   byte addr[8];
   Serial.println("Checking sockets!");
   while ( plugs.search(addr)) {
    Serial.println("Address:");
    for(int i = 0; i < 8; i++) {
    Serial.print(addr[i], HEX);
    Serial.print(" ");
    }
  }
  Serial.print("At location: ");
  Serial.println(findSocket(addr));
  
  plugs.reset_search();
  
  }

int findSocket(byte addr[8]){

   byte addr2[8];
   int dummyvar=1;

  for (int i=0;i<64;i++){//check if already known
    if (socketaddress[5][i]==addr[5]){//one matches, check all
        int k=0;
        int j=5;
        while ((socketaddress[j][i]==addr[j])&&(j<6)) {j++;}
        if (j==6) {return(i);}
      }
    }
    //Serial.println("checked 1");
   //if got this far then its a new plug in a socket, lets find it!
   byte location[6]={0,0,0,0,0,0};

   int lowerbound=0;  //lowest known socket where it can be
   for (int i=0;i<6;i++){
    //Serial.print("check ");
    //Serial.print(i);
    //Serial.println(lowerbound);
    sockets.setAllLow(); //may need to do this selectively if there are other sockets active!
    for (int j=0;j<pow2(5-i);j++){
    socketSet(j+lowerbound, 1);  //turn on first hlaf of next sockets
    }
   delay(1);
   dummyvar=1;
   while ( plugs.search(addr2)&&(dummyvar>0)) {
    dummyvar=1;
    for (int k=0;k<8;k++){if (addr2[k]!=addr[k]){dummyvar++;}}
    dummyvar--;
    }
    if (dummyvar==0){
      location[i]=0;
      }
    else{ //is was not found, lets check if it is in second half
    lowerbound+=pow2(5-i);  
    //Serial.print("lb:");
    //Serial.println(lowerbound);  
    sockets.setAllLow(); //may need to do this selectively if there are other sockets active!
    for (int j=0;j<pow2(5-i);j++){
    socketSet(j+lowerbound, 1);  //turn on second half of next sockets
    }
     delay(1);
     dummyvar=1;
   while ( plugs.search(addr2)&&dummyvar>0) {
    dummyvar=1;
    for (int k=0;k<8;k++){if (addr2[k]!=addr[k]){dummyvar++;}}
    dummyvar--;
    }
    if (dummyvar==0){
      location[i]=1;
      }
      else{ //is was not found in either half, error!
      return(-1); 
     }  
     }
   }

  return(lowerbound);
    
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

void loop() {
  comms.sendRequest(&control1,'S','?',&setLights);
  //delay(50);
  //comms.check();
delay(50);
comms.check();

sockets.setAllHigh();  //turn them all on...
  delay(1);
  checkSockets();   //check what is plugged in
//for (int j=1;j<8;j++){
    
  //setRoom(j,0);
  
  //}
//FastLED.show();  
  

//sockets.setAllHigh(); // set all pins HIGH
//  Serial.print("on");
//  delay(500);
//  
//   
//  sockets.setAllLow(); // set all pins LOW
//  Serial.print("off");
//   delay(500); 
//  
//   
//  for (int i = 0; i < 64; i++) {
//    
//    sockets.set(i, i%2); // set alternate pins HIGH
//    //delay(250); 
//  }
//  Serial.print("half");
//  
//  delay(500);
  
  // set all pins at once
  //uint8_t pinValues[] = { B10101010 }; 
  //sr.setAll(pinValues); 
  //delay(1000);
  
  // read pin (zero based)
  //uint8_t stateOfPin5 = sr.get(5);
  
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
