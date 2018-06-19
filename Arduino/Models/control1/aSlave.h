#include <stdlib.h>
#include <avr/pgmspace.h>  // Library for putting data into program memory
#include <EEPROM.h>        // For writing values to the EEPROM
#include <avr/eeprom.h>    // For writing values to EEPROM

#define aMAX_FUNCTIONS 30
#define aMESSAGE_LENGTH 9

class aHost{
    public:
    aHost();
    void start();  //function that is needed to setup the host properly. running these outside of setup caused problems, don't know why
    void getData();
    void reply();
    void addFunc(char,char,void*);
    char stringBuffer[aMESSAGE_LENGTH+5];
    char returnString[aMESSAGE_LENGTH+1];
    
  private:
    void (*functionList[aMAX_FUNCTIONS])();
    char IDList[3][aMAX_FUNCTIONS];  //list of characters that correspond to a function
    int nFuncs; //how many functions have ben added to the list

    char deviceID[3];    //name of this host
    char inByte;         // incoming serial char
    int messageLength=aMESSAGE_LENGTH;   //length of data (send) message (effectively used 9 previously)
    void sortData();
  };

    aHost::aHost(){
  
      deviceID[0] = char(EEPROM.read(0));
      deviceID[1] = char(EEPROM.read(1)); 
      nFuncs=0;
      
      }

void aHost::start(){
  
      Serial.begin(115200);
      Serial.print("Device ID is: ");
      Serial.print(deviceID[0]);
      Serial.println(deviceID[1]);

  }

void aHost::addFunc(char char1,char char2,void *inputFunction){

  IDList[0][nFuncs]=char1;
  IDList[1][nFuncs]=char2;
  functionList[nFuncs]=inputFunction;
  
  nFuncs++;
  }

void aHost::getData()
{
  // **********GET DATA*******************************************
  // We want to find the bit of interesting data in the serial data stream
  // 
  // All the data arrives as serial commands via the serial interface.
  // All data is in format aXXMIDDDDDDD where XX is the device ID and MI is the message ID
  while (Serial.available() > 0) 
  {
    //Serial.print("Starting...");
    inByte = Serial.read(); // Read whatever is happening on the serial port
    
    if(inByte=='a')    // If we see an 'a' then read in the next 11 chars into a buffer.
    {   
      delay(1); //enough delay to recieve the rest of the message...
      //Serial.print(inByte);
      stringBuffer[0]=inByte;
      for(int i = 0; i<(messageLength+2);i++)  // Read in the next X chars - this is the data
      {
        
        inByte = Serial.read(); 
        //Serial.print(inByte);
        stringBuffer[i+1]=inByte;
      }
      //Serial.println(str_buffer);  // TEST - print the str_buffer data (if it has arrived)
      sortData();
    }
  }
}

void aHost::sortData()
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
        Serial.println("Invalid device ID choice"); 
     }      
    } 
    

    else { 

      for (int i=0;i<nFuncs;i++){//cycle through all the functions that have been set to see if they match
        
      if((stringBuffer[5] == IDList[0][i])&&(stringBuffer[6] == IDList[1][i])){
        
        functionList[i]();         
         
        } 
      } 
    }
  }  
}

void aHost::reply(){

  Serial.print("a");
  Serial.print(stringBuffer[3]);
  Serial.print(stringBuffer[4]);
  String ret=String(returnString);
  Serial.print(ret);
  for (int i=ret.length();i<messageLength;i++){Serial.print('-');}//to ensure the returned data is always above the character limit
  Serial.print('\n');
  
  for (int i=0;i<messageLength+1;i++){returnString[i]='\0';}//reset the return string
  }
