#include <CapacitiveSensor.h>
#include <ShiftRegister74HC595.h>
#include "aSlave.h"


#define totalPins 7
//ShiftRegister74HC595 sr (8, 2, 4, 3); //first one is not connected

aHost dataLink;

// create shift register object (number of shift registers, data pin, clock pin, latch pin)
// ser=data =pin 14, clock=pin 11 latch=pin12, pin 13 low, pin 10 clear, set high to not clear

int capPins[totalPins] = {6,7,8,9,10,11,12};  
int capCPin = 13;
int threshold=3000;

int LEDpins[totalPins]={14,15,16,17,18,19,4};

CapacitiveSensor   CapSense[totalPins]={CapacitiveSensor(capCPin,capPins[0]),CapacitiveSensor(capCPin,capPins[1]),CapacitiveSensor(capCPin,capPins[2]),CapacitiveSensor(capCPin,capPins[3]),CapacitiveSensor(capCPin,capPins[4]),CapacitiveSensor(capCPin,capPins[5]),CapacitiveSensor(capCPin,capPins[6])};
long start = millis();
int mode[totalPins]={0,0,0,1,1,1,1}; //0 = timed or basic (if t=0) 1= toggle 2=off, 3=on
long timer[totalPins]={0,500,10000,0,0,0,0}; //time to stay on for after reset or toggle state!
long timereset[totalPins]={start,start,start,start,start,start,start}; //time to stop being on if relevant
long total[totalPins]; //array to hold the state of the leds




 
void setup() { 
    for (int i=0;i<totalPins;i++)
  {
    //setup sensors... 
    CapSense[i].set_CS_Timeout_Millis(20);
    }

for (int i = 0; i < totalPins; i++) {
    pinMode(LEDpins[i],OUTPUT);
    digitalWrite(LEDpins[i],0);
  }

   dataLink.start();
   dataLink.addFunc('S','?',&sendState);  //ask for state
   dataLink.addFunc('?','M',&setMode);  //set Mode  as aIDMD?MPM   where P is pin and M is mode: 0 TIMED, 1 TOGGLE, 2 OFF, 3 ON
   dataLink.addFunc('?','T',&setTimer);  //set Delay Timer aIDMD?MPTTTT  where P is pin and T is Timer * 0.1 seconds
}

void loop() {

      for (int i=0;i<totalPins;i++)
        {
        total[i] =  CapSense[i].capacitiveSensor(30);
        if (total[i] > threshold || total[i]==-2)   //case includes timing out as pressed signal
      { //PRESSED
     
    if (mode[i]==0){
    
    total[i]=1; // instantaneous OR timed mode
    if (timereset[i]<millis()){timereset[i]=millis()+timer[i];}
      }
      else if (mode[i]==1){ //toggle mode
        if (timer[i]==0){timer[i]=1; total[i]=0;}//includes debounce requiring two reads to change the state
        if (timer[i]==1){timer[i]=2; total[i]=1;}
        if (timer[i]==2){timer[i]=2; total[i]=1;}
        if (timer[i]==3){timer[i]=2; total[i]=1;}
        if (timer[i]==4){timer[i]=5; total[i]=1;}
        if (timer[i]==5){timer[i]=6; total[i]=0;}
        if (timer[i]==6){timer[i]=6; total[i]=0;}
        if (timer[i]==7){timer[i]=6; total[i]=0;}
      }
      else if (mode[i]==2){//always off
        total[i]=0;
      }
      else if (mode[i]==3){//always on
        total[i]=1;
      }    
   }
    else { //NOT PRESSED
    if (mode[i]==0){// instantaneous/timed mode
    
    total[i]=0; 
    if (timereset[i]>millis()){total[i]=1;}
    }
      
    else if (mode[i]==1){ //toggle mode
        if (timer[i]==0){timer[i]=0; total[i]=0;}//includes debounce requiring two reads to change the state
        if (timer[i]==1){timer[i]=0; total[i]=0;}
        if (timer[i]==2){timer[i]=3; total[i]=1;}
        if (timer[i]==3){timer[i]=4; total[i]=1;}
        if (timer[i]==4){timer[i]=4; total[i]=1;}
        if (timer[i]==5){timer[i]=4; total[i]=1;}
        if (timer[i]==6){timer[i]=7; total[i]=0;}
        if (timer[i]==7){timer[i]=0; total[i]=0;}
    }
    else if (mode[i]==2){//always off
    total[i]=0;
    }
    else if (mode[i]==3){//always on
    total[i]=1;
    }
    }
    
    digitalWrite(capPins[i],0);
  }
  digitalWrite(13,0);
  
  
  
  for (int i = 0; i < totalPins; i++) {
    
    digitalWrite(LEDpins[i],total[i]);
    //sr.set(i+1, total[i]); 
  }  

  dataLink.getData();
  
}


void sendState(){
  char tempString[10];
  for (int i = 0; i < totalPins; i++) {
    tempString[i]=total[i]+'0';   //results in the string 0011010 for example
  }
  strcpy(dataLink.returnString,tempString);
  dataLink.reply();
  }

void setMode(){
  int tempD=dataLink.stringBuffer[7]-'0';
  int pin;
  if ((tempD>-1) && (tempD<totalPins)){pin=tempD;
  
  tempD=dataLink.stringBuffer[8]-'0';
  if ((tempD>-1) && (tempD<4)){
    mode[pin]=tempD;
    timereset[pin]=0;
    timer[pin]=0;
    strcpy(dataLink.returnString,"Done");
    dataLink.reply();
    }
 
  }

  strcpy(dataLink.returnString,"Fail");
  dataLink.reply();
  
  }


void setTimer(){

  long tempD=dataLink.stringBuffer[7]-'0';
  int pin;
  if ((tempD>-1) && (tempD<totalPins)){
  pin=tempD;
  
  if (mode[pin]==0){ //only set timer if the mode can be timed
  timer[pin]=0;
  int digits=0;
  tempD=dataLink.stringBuffer[11]-'0';
  if ((tempD>-1) && (tempD<10)){timer[pin]+=tempD*(long)powint(10,digits)*100; digits++;}
  tempD=dataLink.stringBuffer[10]-'0';
  if ((tempD>-1) && (tempD<10)){timer[pin]+=tempD*(long)powint(10,digits)*100; digits++;}
  tempD=dataLink.stringBuffer[9]-'0';
  if ((tempD>-1) && (tempD<10)){timer[pin]+=tempD*(long)powint(10,digits)*100; digits++;}
  tempD=dataLink.stringBuffer[8]-'0';
  if ((tempD>-1) && (tempD<10)){timer[pin]+=tempD*(long)powint(10,digits)*100; digits++;}
  
  timereset[pin]=0;
  strcpy(dataLink.returnString,"Done");
  dataLink.reply();
  return;
  }
  }
  strcpy(dataLink.returnString,"Fail");
  dataLink.reply();
  }

long powint(int factor, unsigned int exponent)
{
   long product = 1;
   while (exponent--)
      product *= factor;
   return product;
}
