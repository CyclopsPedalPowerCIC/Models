#include <CapacitiveSensor.h>

/*
 * CapitiveSense Library Demo Sketch
 * Paul Badger 2008
 * Uses a high value resistor e.g. 10 megohm between send pin and receive pin
 * Resistor effects sensitivity, experiment with values, 50 kilohm - 50 megohm. Larger resistor values yield larger sensor values.
 * Receive pin is the sensor pin - try different amounts of foil/metal on this pin
 * Best results are obtained if sensor foil and wire is covered with an insulator such as paper or plastic sheet
 */
int capPins[16] = {3,4,5,6,7,8,9,10,11,12,14,15,16,17,18,19};  
int capCPin = 13;

CapacitiveSensor   CapSense[16]={CapacitiveSensor(capCPin,capPins[0]),CapacitiveSensor(capCPin,capPins[1]),CapacitiveSensor(capCPin,capPins[2]),CapacitiveSensor(capCPin,capPins[3]),CapacitiveSensor(capCPin,capPins[4]),CapacitiveSensor(capCPin,capPins[5]),CapacitiveSensor(capCPin,capPins[6]),CapacitiveSensor(capCPin,capPins[7]),CapacitiveSensor(capCPin,capPins[8]),CapacitiveSensor(capCPin,capPins[9]),CapacitiveSensor(capCPin,capPins[10]),CapacitiveSensor(capCPin,capPins[11]),CapacitiveSensor(capCPin,capPins[12]),CapacitiveSensor(capCPin,capPins[13]),CapacitiveSensor(capCPin,capPins[14]),CapacitiveSensor(capCPin,capPins[15])};

//CapacitiveSensor   cs_4_2 = CapacitiveSensor(12,4);        // 10 megohm resistor between pins 4 & 2, pin 2 is sensor pin, add wire, foil
//CapacitiveSensor   cs_4_6 = CapacitiveSensor(12,5);        // 10 megohm resistor between pins 4 & 6, pin 6 is sensor pin, add wire, foil
//CapacitiveSensor   cs_4_8 = CapacitiveSensor(12,6);        // 10 megohm resistor between pins 4 & 8, pin 8 is sensor pin, add wire, foil

void setup()                    
{

  for (int i=0;i<16;i++)
  {
    //setup sensors... 
    //CapSense[i] = CapacitiveSensor(13,capPins[i]);
    CapSense[i].set_CS_Timeout_Millis(200);
    //CapSense[i].set_CS_AutocaL_Millis(0xFFFFFFFF);
    }
   Serial.begin(9600);

}

void loop()                    
{
    
    //Serial.print(" Hello!..."); 
    long start = millis();
    long total[16];
      for (int i=0;i<16;i++)
  {
    total[i] =  CapSense[i].capacitiveSensor(30);
    digitalWrite(capPins[i],0);
  }
  
    digitalWrite(13,0);
    Serial.print(millis() - start);        // check on performance in milliseconds
    Serial.print("\t");                    // tab character for debug window spacing

          for (int i=0;i<16;i++)
  {
    Serial.print(total[i]);
    Serial.print("\t");
  }
    Serial.print("\n");

    delay(50);                             // arbitrary delay to limit data to serial port 
}
