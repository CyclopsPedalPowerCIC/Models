
#define aMAX_MESSAGES 30


class aDevice{//code to run on master device
  public:
    aDevice();
    aDevice(char dID1,char dID2, int mLength);
    char deviceID[3];
    char* returnString;  
    int state=0;  //waiting: 0, recieved: 1, dormant: 2, dummy: 3, errror: 4?
    int messageLength;

  };

aDevice::aDevice(){
  deviceID[0]='A';
  deviceID[1]='A';
  messageLength=9;
  char dummyString[messageLength+1];
  returnString=dummyString;
  }

aDevice::aDevice(char dID1,char dID2, int mLength){
  deviceID[0]=dID1;
  deviceID[1]=dID2;
  messageLength=mLength;
  char dummyString[messageLength+1];
  returnString=dummyString;
  }

class aComms{
  public:
    aComms();
    aComms(int);
    aDevice newDevice(char,char);
    sendRequest(aDevice,char,char);

    check();
  private:
    char inByte;
    char mID[3][aMAX_MESSAGES];  //messagee id to send
    aDevice devices[aMAX_MESSAGES]; //device that corresponds to the message id
    aDevice dummy; //to fill up above array with a dummy variable
    int currentID=0;
    int messageLength;  //max message to be received
    char* stringBuffer;
    sortData();
  };


aComms::aComms(int mLength){
    Serial.begin(115200);
    dummy.state=3;
    char dummyString[messageLength+4];
    stringBuffer=dummyString;
    messageLength= mLength;
    for (int i=0;i<aMAX_MESSAGES;i++){
        mID[0][i]='R';
        if (i<10) {mID[1][i]='0'+i;}
        else if (i<36)  {mID[1][i]='A'-10+i;}
        else if (i<62)  {mID[1][i]='a'-36+i;}
        devices[i]=dummy;
      }

  }
  

aComms::aComms(){
    Serial.begin(115200);
    dummy.state=2;
    messageLength=9;
    char dummyString[messageLength+4];
    stringBuffer=dummyString;
    for (int i=0;i<aMAX_MESSAGES;i++){
        mID[0][i]='R';
        if (i<10) {mID[1][i]='0'+i;}
        else if (i<36)  {mID[1][i]='A'-10+i;}
        else if (i<62)  {mID[1][i]='a'-36+i;}
        devices[i]=dummy;
      }

  }
  
aDevice aComms::newDevice(char ID1, char ID2){
  
  aDevice device(ID1,ID2, messageLength);
  device.state=2;
  return device;
  }

  
aComms::sendRequest(aDevice device,char request1,char request2){
    device.state=0;
    devices[currentID]=device;
    Serial.print('a');
    Serial.print(device.deviceID[0]);
    Serial.print(device.deviceID[1]);
    Serial.print(mID[0][currentID]);
    Serial.print(mID[1][currentID]);
    Serial.print(request1);
    Serial.print(request2);
    for (int i=0;(i<messageLength-4);i++){
      Serial.print('-');}
    Serial.print('\n');
    
    currentID=(currentID+1)%aMAX_MESSAGES;
  } 

aComms::check(){

  while (Serial.available() > 1) 
  {
    inByte = Serial.read(); // Read whatever is happening on the serial port
    //Serial.print(inByte);
    if(inByte=='a')    // If we see an 'a' then read in the next 11 chars into a buffer.
    {   
      delay(1);
      stringBuffer[0]=inByte;
      int i;
      for(i = 0; i<(messageLength+2);i++)  // Read in the next X chars - this is the data
      {
        inByte = Serial.read(); 
        stringBuffer[i+1]=inByte;
        //Serial.print(inByte);
      }
      sortData();
      
    }
  }
}

aComms::sortData()
{ 
  // We first want to check if the device ID matches.
  // If it does not then we disregard the command (as it was not meant for this device      
  //Serial.println(stringBuffer);
  
  int i;
  if(stringBuffer[1] == 'R'){
    Serial.println("R True");
    for (i=0;i<aMAX_MESSAGES;i++)
      {
      if(stringBuffer[2] == mID[1][i]){
        Serial.println(devices[i].state);
        if (devices[i].state==0){
        //if (true) {
        Serial.print(i);

        char returned[messageLength];
        for (int k=0;k<messageLength;k++){
          returned[k]=stringBuffer[3+k];
          Serial.print(k);
          }
        strcpy(devices[i].returnString,returned);
        Serial.print("place 1");
        devices[i].state=1;
        strcpy(stringBuffer,"");
        Serial.print("Received: ");
        Serial.print(devices[i].returnString);

        }         
      }
    }
  }
}

