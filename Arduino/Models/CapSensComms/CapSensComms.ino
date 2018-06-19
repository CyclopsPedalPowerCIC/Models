


/************ External Libraries*****************************/

#include <CapacitiveSensor.h>
#include <stdlib.h>
#include <avr/pgmspace.h>  // Library for putting data into program memory
#include <EEPROM.h>        // For writing values to the EEPROM
#include <avr/eeprom.h>    // For writing values to EEPROM
#include <string.h>


char inByte;         // incoming serial char
#define MAX_STRING 13      // Sets the maximum length of string
char stringBuffer[MAX_STRING];  // A buffer to hold the string when pulled from program memory

char deviceID[3]; // A buffer to hold the device ID

int hiByte;      // These are used to store longer variables into EERPRPROM
int loByte;


int capPins[16] = {3,4,5,6,7,8,9,10,11,12,14,15,16,17,18,19};  
int capCPin = 13;
int threshold=3000;

CapacitiveSensor   CapSense[16]={CapacitiveSensor(capCPin,capPins[0]),CapacitiveSensor(capCPin,capPins[1]),CapacitiveSensor(capCPin,capPins[2]),CapacitiveSensor(capCPin,capPins[3]),CapacitiveSensor(capCPin,capPins[4]),CapacitiveSensor(capCPin,capPins[5]),CapacitiveSensor(capCPin,capPins[6]),CapacitiveSensor(capCPin,capPins[7]),CapacitiveSensor(capCPin,capPins[8]),CapacitiveSensor(capCPin,capPins[9]),CapacitiveSensor(capCPin,capPins[10]),CapacitiveSensor(capCPin,capPins[11]),CapacitiveSensor(capCPin,capPins[12]),CapacitiveSensor(capCPin,capPins[13]),CapacitiveSensor(capCPin,capPins[14]),CapacitiveSensor(capCPin,capPins[15])};

void setup()                    
{

  for (int i=0;i<16;i++)
  {
    //setup sensors... 
    CapSense[i].set_CS_Timeout_Millis(20);
    }
   Serial.begin(115200);

     // Read in the values from EEPROM
  // Read the device ID
  deviceID[0] = char(EEPROM.read(0));
  deviceID[1] = char(EEPROM.read(1)); 
  Serial.print("Device ID is: ");
  Serial.print(deviceID[0]);
  Serial.println(deviceID[1]);

}

void loop()                    
{
    
    //Serial.print(" Hello!..."); 
    long start = millis();
    long total[16];
      for (int i=0;i<16;i++)
  {

    
    total[i] =  CapSense[i].capacitiveSensor(30);
    if (total[i] > threshold || total[i]==-2)   //case includes timing out as pressed signal
      {total[i]=1;}
    else {total[i]=0;}
    digitalWrite(capPins[i],0);
    getData(); //this is so fast, when theres nothing there 4us, 0.4ms if respond can be run every loop
  }
  
    digitalWrite(13,0);

    if (false){
    Serial.print(millis() - start);        // check on performance in milliseconds
    Serial.print("\t");                    // tab character for debug window spacing

          for (int i=0;i<16;i++)
  {
    Serial.print(total[i]);
    Serial.print("");
  }
    Serial.print("\n");

    delay(50);                             // arbitrary delay to limit data to serial port 
}
}



void sendData(){
  //when data has been asked for...

  int mult=1;
  int compact=0;  //fits 16 bits into 5 decimal numbers
  for (i=0;i<16;i++){
    
    compact+=mult*total[i];
    mult=mult*2; 
    
    }
  Serial.print(a);  //start reply
  Serial.print(stringBuffer[3]);
  Serial.print(stringBuffer[4]);//messageID  
  Serial.print(compact);
  Serial.print("~~~~~~~~"); //fill remaining spaces
  
  }

void getData()
{
  // **********GET DATA*******************************************
  // We want to find the bit of interesting data in the serial data stream
  // As mentioned above, we are using LLAP for the data.
  // All the data arrives as serial commands via the serial interface.
  // All data is in format aXXMIDDDDDDD where XX is the device ID and MI is the message ID
  while (Serial.available() > 0) 
  {
    inByte = Serial.read(); // Read whatever is happening on the serial port
  
    if(inByte=='a')    // If we see an 'a' then read in the next 11 chars into a buffer.
    {   
      stringBuffer[0]=inByte;
      for(int i = 0; i<11;i++)  // Read in the next 11 chars - this is the data
      {
        inByte = Serial.read(); 
        stringBuffer[i+1]=inByte;
      }
      //Serial.println(str_buffer);  // TEST - print the str_buffer data (if it has arrived)
      sortData();
    }
  }
}

// **********************SORT DATA SUBROUTINE*****************************************
// This sub-routine takes the read-in data string (12 char, starting with a) and does what is required with it
// The str-buffer is global so we do not need to send it to the routine

void sortData()
{ 
  // We first want to check if the device ID matches.
  // If it does not then we disregard the command (as it was not meant for this device      
  if((stringBuffer[1] == deviceID[0])&&(stringBuffer[2] == deviceID[1]))
  {
    // If yes then we can do further checks on ths data
    // This is where we do all of the checks on the incomming serial command:
    
    //Serial.println("OK");  // TEST - got into this routine
    // Change device ID:
    // Device ID
    // “aXXCHIDXXE--“
    // Where the last two values (XX) are the new device ID (from AA to ZZ).
    if((stringBuffer[3] == 'C')&&(stringBuffer[4] == 'H')&&(stringBuffer[5] == 'I')&&(stringBuffer[6] == 'D'))
    {
      // First check if the NEW device ID is within the allowable range (AA-ZZ)
      // to do this we can convert to an int and check if it is within the OK levels
      // A -> int is 65, Z -. int is 90
      // So our new device ID as an int must be between 65 and 90 for it to be valid
      if(65<=int(stringBuffer[7])&&int(stringBuffer[7])<=90&&65<=int(stringBuffer[8])&&int(stringBuffer[8])<=90)   
      { // If is all OK then write the data
        // Change device ID
        Serial.print("Changing Device ID from ");
        Serial.print(deviceID);
        Serial.print(" to ");
        Serial.print(stringBuffer[7]); 
        Serial.println(stringBuffer[8]);  // This will change the device ID
        deviceID[0] = stringBuffer[7];
        deviceID[1] = stringBuffer[8];
        // Also want to store this into EEPROM
        EEPROM.write(0, deviceID[0]);    // Do this seperately
        EEPROM.write(1, deviceID[1]);
      }
      else
      {
        //Serial.println("Invalid device ID"); 
     }      
    } 
    
     // Ask Data
    //  To ask the set-point we can send:
    //  “aXXD?-----“ 
    else if((stringBuffer[5] == 'D')&&(stringBuffer[6] == '?'))
    //else
    {
      sendData();
    } 

    
  }
  
}

