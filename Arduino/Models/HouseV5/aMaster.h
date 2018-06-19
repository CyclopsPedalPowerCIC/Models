
#define aMAX_MESSAGES 30
#define aMESSAGE_LENGTH 9

class aDevice{//code to run on master device
  public:
    aDevice();
    aDevice(char dID1,char dID2);
    char deviceID[3];
    char returnString[aMESSAGE_LENGTH+1];  
    int state=0;  //waiting: 0, recieved: 1, dormant: 2, dummy: 3, errror: 4?
    int messageLength;

  };

aDevice::aDevice(){
  deviceID[0]='A';
  deviceID[1]='A';
  messageLength=aMESSAGE_LENGTH;
  }

aDevice::aDevice(char dID1,char dID2){
  deviceID[0]=dID1;
  deviceID[1]=dID2;
  messageLength=aMESSAGE_LENGTH;
  }

class aComms{
  public:
    aComms();
    aComms(int);
    aDevice newDevice(char,char);
    void sendRequest(aDevice*,char,char);
    void sendRequest(aDevice*,char,char,void(*)()); //includes option to run a function when the data is recieved
    bool mState[aMAX_MESSAGES]; //keeps a log of whether messages are received
    void check();
  private:
    void (*functionList[aMAX_MESSAGES])();
    char inByte;
    char mID[3][aMAX_MESSAGES];  //messagee id to send
    aDevice *devices[aMAX_MESSAGES]; //device that corresponds to the message id
    
    
    aDevice dummy; //to fill up above array with a dummy variable
    int currentID=0;
    //void aDummy();
    int messageLength;  //max message to be received
    char stringBuffer[aMESSAGE_LENGTH+5];
    void sortData();
  };

void aCommsaDummy(){}//A function that does Nothing

aComms::aComms(){
    //Serial.begin(115200);
    dummy.state=3;
    messageLength=aMESSAGE_LENGTH;
    for (int i=0;i<aMAX_MESSAGES;i++){
        mState[i]=1;
        mID[0][i]='R';
        if (i<10) {mID[1][i]='0'+i;}
        else if (i<36)  {mID[1][i]='A'-10+i;}
        else if (i<62)  {mID[1][i]='a'-36+i;}
        devices[i]=&dummy;
        functionList[i]=&aCommsaDummy;
      }

  }
  


  
aDevice aComms::newDevice(char ID1, char ID2){
  
  aDevice device(ID1,ID2);
  device.state=2;
  return device;
  }

  
void aComms::sendRequest(aDevice *device,char request1,char request2){
    (*device).state=0;
    mState[currentID]=0;//set state ready for recieve
    devices[currentID]=device;
    Serial.print('a');
    Serial.print((*device).deviceID[0]);
    Serial.print((*device).deviceID[1]);
    Serial.print(mID[0][currentID]);
    Serial.print(mID[1][currentID]);
    Serial.print(request1);
    Serial.print(request2);
    for (int i=0;(i<messageLength-4);i++){
      Serial.print('-');}
    Serial.print('\n');
    
    currentID=(currentID+1)%aMAX_MESSAGES;
  } 

void aComms::sendRequest(aDevice *device,char request1,char request2,void (*inputFunction)()){
    (*device).state=0;
    mState[currentID]=0;//set state ready for recieve
    devices[currentID]=device;
    functionList[currentID]=inputFunction;
    Serial.print('a');
    Serial.print((*device).deviceID[0]);
    Serial.print((*device).deviceID[1]);
    Serial.print(mID[0][currentID]);
    Serial.print(mID[1][currentID]);
    Serial.print(request1);
    Serial.print(request2);
    for (int i=0;(i<messageLength-4);i++){
      Serial.print('-');}
    Serial.print('\n');
    
    currentID=(currentID+1)%aMAX_MESSAGES;
  } 

void aComms::check(){

  while (Serial.available() > 1) 
  {
    inByte = Serial.read(); // Read whatever is happening on the serial port
    //Serial.print(inByte);
    if(inByte=='a')    // If we see an 'a' then read in the next 11 chars into a buffer.
    {   
      delay(1);
      stringBuffer[0]=inByte;
      int i;
      for(i = 0; i<(messageLength+3);i++)  // Read in the next X chars - this is the data
      {
        inByte = Serial.read(); 
        stringBuffer[i+1]=inByte;
        //Serial.print(inByte);
      }
      sortData();
      
    }
  }

}

void aComms::sortData()
{ 
  // We first want to check if the device ID matches.
  // If it does not then we disregard the command (as it was not meant for this device      
  //Serial.println(stringBuffer);
  
  int i;
  if(stringBuffer[1] == 'R'){
    for (i=0;i<aMAX_MESSAGES;i++)
      {
      if(stringBuffer[2] == mID[1][i]){
        //Serial.println(devices[i].state);
        if (mState[i]==0){
        //if (true) {
        //Serial.print(i);

        char returned[messageLength+1];
        for (int k=0;k<messageLength;k++){
          returned[k]=stringBuffer[3+k];
          }
          returned[messageLength]='\0'; //add null terminator to complete the string
        strcpy((*devices[i]).returnString,returned);

        (*devices[i]).state=1;
        mState[i]=1;
        //Serial.println(stringBuffer);
        strcpy(stringBuffer,"");
        //Serial.println(stringBuffer);
        //Serial.print("Received: ");
        //Serial.print((*devices[i]).returnString);
        functionList[i]();
        //Serial.print("END");
        }         
      }
    }
  }
}

