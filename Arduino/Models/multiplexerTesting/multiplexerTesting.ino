#define EN1pin 2
#define EN2pin 3
#define S0pin 4
#define S1pin 5
#define S2pin 6
#define S3pin 7
#define cappin1 8
#define cappin2 9
#define EN3pin 10

#define cappin3 11
#define cappin4 12

#include <CapacitiveSensor.h>
long value;
CapacitiveSensor CapSense = CapacitiveSensor(cappin1,cappin2);

CapacitiveSensor CapSense2 = CapacitiveSensor(cappin3,cappin4);


void setup() {
  // put your setup code here, to run once:

//CapSense.set_CS_AutocaL_Millis(0xFFFFFFFF);
//CapSense.set_CS_AutocaL_Millis(0xFFFFFFFF);
//pinMode(sigpin,OUTPUT);
//pinMode(cappin1,INPUT);
//pinMode(cappin2,OUTPUT);  //do not set these!!!
pinMode(EN1pin,OUTPUT);
pinMode(EN2pin,OUTPUT);
pinMode(EN3pin,OUTPUT);
pinMode(S0pin,OUTPUT);
pinMode(S1pin,OUTPUT);
pinMode(S2pin,OUTPUT);
pinMode(S3pin,OUTPUT);
Serial.begin(115200);

CapSense.set_CS_Timeout_Millis(300);
CapSense2.set_CS_Timeout_Millis(300);

}

int threshold=20000;

void loop() {
 // put your main code here, to run repeatedly:
 // connectPin(11);
 // digitalWrite(sigpin,0);
 // delay(500);
 // digitalWrite(sigpin,1);  
 // delay(500);
  
for (int i=0;i<48;i++){
    connectPin(i);
    delay(50);
    //value=CapSense.capacitiveSensor(30);//digitalRead(sigpin);
    if (i<32){
      value=CapSense.capacitiveSensor(30);}
    else{
      value=CapSense2.capacitiveSensor(30);}
    //if (value>threshold||value==-2) {value=1;} else {value=0;}
    Serial.print(value);
    Serial.print(" ");
  }
    Serial.print("\n");
  
}


int connectPin(int number){
  
  digitalWrite(S0pin,int(floor(float(number)/1.0))%2);
  digitalWrite(S1pin,int(floor(float(number)/2.0))%2);
  digitalWrite(S2pin,int(floor(float(number)/4.0))%2);
  digitalWrite(S3pin,int(floor(float(number)/8.0))%2);
  if ((number>=0)&&(number<16)){digitalWrite(EN1pin,1);} else {digitalWrite(EN1pin,0);}
  if ((number>=16)&&(number<32)){digitalWrite(EN2pin,1);} else {digitalWrite(EN2pin,0);}
  if ((number>=32)&&(number<48)){digitalWrite(EN3pin,1);} else {digitalWrite(EN3pin,0);}
  }
