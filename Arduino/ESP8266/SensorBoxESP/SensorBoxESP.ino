//super basic version...


//int pinEN=10;
//int pinS0=9;
//int pinS1=13;
//int pinS2=11;
//int pinS3=12;

int pinEN=2;
int pinS0=0;
int pinS1=4;
int pinS2=5;
int pinS3=16;

void setup() {
  // put your setup code here, to run once:
Serial.begin(9600);
Serial.print("initialising...\n");
pinMode(pinEN,OUTPUT);
pinMode(pinS0,OUTPUT);
pinMode(pinS1,OUTPUT);
pinMode(pinS2,OUTPUT);
pinMode(pinS3,OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  
 //int data=getaninput(0);
 int data=analogRead(A0);
 
// sprintf(buf, "Hello!%d", data);
 getaninput(0);
 
 delay(500); 
}

int getaninput(int pin){
  
  pin=0;
  for (pin=0;pin<6;pin++){
  digitalWrite(pinEN,0);
  digitalWrite(pinS0,((pin))%2);
  digitalWrite(pinS1,((pin/2))%2);
  digitalWrite(pinS2,((pin/4))%2);
  digitalWrite(pinS3,((pin/8))%2);
  digitalWrite(pinEN,0);
  delay(4);//to stop leakage from previous measurement
  float input=analogRead(A0);
  input=input/18.0;
  if (input<0.5) {input=0;}
  //delay(20);
  digitalWrite(pinEN,0);
  Serial.print((input));
  Serial.print(" on A");
  Serial.print(pin);
  Serial.print(", ");
  }
int currzero[6]={504,506,502,507,506,496};
  for (pin=6;pin<12;pin++){
  digitalWrite(pinEN,0);
  digitalWrite(pinS0,((pin))%2);
  digitalWrite(pinS1,((pin/2))%2);
  digitalWrite(pinS2,((pin/4))%2);
  digitalWrite(pinS3,((pin/8))%2);
  digitalWrite(pinEN,0);
  delay(4);//to stop leakage from previous measurement
  float input=analogRead(A0);
  input=currzero[pin-6]-input;
  input=input*0.037;
  if (input<0.2) {input=0;}
  //delay(20);
  digitalWrite(pinEN,0);
  Serial.print((input));
  Serial.print(" on A");
  Serial.print(pin);
  Serial.print(", ");
  }
  
  Serial.print("\n");
  return 0;
  
  }
