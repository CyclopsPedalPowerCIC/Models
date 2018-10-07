//#define FASTLED_ESP8266_NODEMCU_PIN_ORDER //this appears to be its default behaviour
#define FASTLED_ESP8266_RAW_PIN_ORDER  //needed to stop the fastLED library being too clever for its own good and assuming D2->GPOI19->D19
#define FASTLED_ALLOW_INTERRUPTS 0
#include "FastLED.h"
#include <ShiftRegister74HC595.h>

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
  
void setup() { 
  Serial.begin(9600);

      FastLED.addLeds<WS2812B, DATA_PIN, GRB>(leds, NUM_LEDS);
      //FastLED.setBrightness(127);

      pinMode(LED_BUILTIN, OUTPUT);
      pinMode(D0, OUTPUT); 
      pinMode(D1, OUTPUT); 
      pinMode(D2, OUTPUT); 
      pinMode(D3, INPUT);
      digitalWrite(D3,0); 
      pinMode(D4, OUTPUT); 
}

void loop() { 

  checkSwitches();
  
  for (int i=0;i<28;i++){
    
    setBlock(i,CRGB::Green);
    delay(4);
    checkSwitches();
    FastLED.show();
    }
    for (int i=0;i<28;i++){
    
    setBlock(i,CRGB::Green);
    delay(4);
    checkSwitches();
    FastLED.show();
    }  

 
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
      }
    else {
      Serial.print(" ");
      
    setCorner(switchMap[i],CRGB::White);
      }
    
    }
    Serial.println("");


  
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
