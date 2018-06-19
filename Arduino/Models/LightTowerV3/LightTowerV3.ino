//version modified to include a non activation 1/3 of the range, to ensure that the power is above 12V when activated

//Version loaded onto the light tower on 7/1/18. potentially the final version... 


int pina0=5;
int pina1=6;
int pina2=7;
int pinD=2;
int pinE1=4;
int pinE2=3;
int pinAn=A0;

float mratio =0.45;



void setup() {
  // put your setup code here, to run once:
  digitalWrite(pinE1,1);  //an attempt to stop flickering of the outputs on startup
  digitalWrite(pinE2,1);

  pinMode(pina0,OUTPUT);
  pinMode(pina1,OUTPUT);
  pinMode(pina2,OUTPUT);
  pinMode(pinE1,OUTPUT);
  pinMode(pinE2,OUTPUT);
  pinMode(pinD,OUTPUT);
  pinMode(pinAn,INPUT);
  setLevel(0);

}

void loop() {

int height=analogRead(pinAn);

height=int(max(height/17/(1+mratio)-17*mratio,0));  //remember there are 17 options so level goes up to 16, the level should therefore reach over 16

setLevel(height);

delay(250);

}

void setLevel(int level){

  
  int i;

  if (level>16) {level=16;}
  if (level<0) {level=0;}

  for (i=0;i<level;i++){setOutput(i,1);}
 
  for (i=level;i<16;i++){setOutput(i,0);}
  
  }

void setOutput(int outputN,int value){

  outputN=15-outputN;

  if (outputN>15) return;  //return if value out of range
  if (outputN<0) return;
  

  if ((outputN%2)==0) {digitalWrite(pina0,0);} else {digitalWrite(pina0,1);}
  if ((int(outputN/2)%2)==0) {digitalWrite(pina1,0);} else {digitalWrite(pina1,1);} 
  if ((int(outputN/4)%2)==0) {digitalWrite(pina2,0);} else {digitalWrite(pina2,1);} 
  digitalWrite(pinD, value);
  delay(1);
  
  
  if (outputN>7) {
    digitalWrite(pinE1,0);   //enable the correct multiplexer
    digitalWrite(pinE2,1);
    //outputN-=8;
    } 
  else{
    digitalWrite(pinE1,1);
    digitalWrite(pinE2,0);
    } 
  delay(1);
  
  digitalWrite(pinE1,1); //disable the pins before returning to the program
  digitalWrite(pinE2,1);
  }
