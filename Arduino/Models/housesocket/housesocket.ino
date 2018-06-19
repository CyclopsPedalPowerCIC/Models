
#include <OneWire.h>

#define OneWirePin 5

OneWire  plugs(OneWirePin);


void setup() {
  Serial.begin(115200);  // a requirement since all uses serial
   Serial.println("Starting");
  // put your setup code here, to run once:

}

void loop() {
  checkSockets();
  delay(1000);
  // put your main code here, to run repeatedly:

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
  plugs.reset_search();
  
  }
