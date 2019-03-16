import json
import random
import boto3
import datetime
import string

# version 0.0.6

def lambda_handler(event, context):
    type = event['body']['type']
    IP = event['body']['IP']
    
    g = APIResult(type)
    g.createPassword()
    g.returnResponse()
    passwordResult = g.returnCreatedPassword()
    
    w = WriteToDynamo(IP, context.aws_request_id)
    
    return {
        'statusCode': g.status,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps(passwordResult),
        'writeResult': w.writeToDynamo(),
        'typeProvided': type,
        'requestID':context.aws_request_id
    }
    
""" Wrapper method to connect to and writeStatus
    specific data of via DynamoDB instance """
class WriteToDynamo():
    def __init__(self, IP, requestID):
        self.setTableName('ReturnedLeetPasswords')
        self.dynamodb = self.initDynamo()
        self.IP = IP
        self.requestID = requestID
        
    def returnTableName(self):
        return self.TableName
        
    def initDynamo(self):
        return boto3.client('dynamodb')
        
    def setTableName(self, name):
        self.TableName = name
        
    def generatePrimaryID(self):
        return str(random.randrange(10**11, 10**12))
        
    def generateTimeStamp(self):
        return str(datetime.datetime.now())
        
    def processDynamoWrite(self):
        return self.dynamodb.put_item(TableName=self.returnTableName(), 
Item={'id':{'N':self.generatePrimaryID()},'requestID':{'S':self.requestID},'timestamp':{'S':self.generateTimeStamp()},'IP':{'S':self.returnIP()}})
        
    def returnIP(self):
        return self.IP
        
    def writeToDynamo(self):
        return 'success' if self.processDynamoWrite() else 'failure'
        
""" Wrapper method to retrieve password and
    format the response """
class APIResult:
    def __init__(self, type):
        self.pw = GeneratePassword(type)
        
    def createPassword(self):
        self.finalPassword = self.pw.returnCreatedPassword()
        
    def returnCreatedPassword(self):
        return self.finalPassword
        
    def returnResponse(self):
        if self.finalPassword:
            self.status = 200
            self.response = self.finalPassword
        else:
            self.status = 500
            self.response = 'Error occured creating the password. Yell 
at your computer screen now to resolve.'

""" Generates a string based on 
    the type passed in """
class GeneratePassword:
    def __init__(self, type):
        self.type = type
        self.generatePassword()
        
    def returnCreatedPassword(self):
        return self.createdPassword
        
    def generatePassword(self):
        if self.type == 'complex':
            self.generateComplexPassword()
        elif self.type == 'leet':
            self.generateLeetPassword()
        
    def generateComplexPassword(self, stringLength=25):
        lettersAndDigits = string.ascii_letters + string.digits
        self.createdPassword = ''.join(random.choice(lettersAndDigits) 
for i in range(stringLength))
        
    def generateLeetPassword(self):
        self.createdPassword =  str(self.generateFirstBlob() + 
self.generateThirdBlob() + self.generateSecondBlob())
        
    def generateFirstBlob(self):
        return random.choice(self.returnBadWordsList())
        
    def generateSecondBlob(self):
        return random.choice(self.returnGoodWordsList())
        
    def generateThirdBlob(self):
        return random.choice(self.returnSpecialCharactersList())
        
    def returnBadWordsList(self):
        return ['6r01n', 'bu77', '703j4m', 'b0063r', 'puk3', 'd0n6']
        
    def returnGoodWordsList(self):
        return ['7035', 'k1773n', 'pudd1n6', 'ch41r', 'c4r']
        
    def returnSpecialCharactersList(self):
        return ['>', '*', '$', '=', '_', '<', '&', '#', '%', '@', '!']
