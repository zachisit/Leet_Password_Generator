import json
import random
import boto3

# version 0.0.2

def lambda_handler(event, context):
    g = APIResult()
    g.createPassword()
    g.returnResponse()
    
    w = WriteToDynamo()
    
    return {
        'statusCode': g.status,
        'body': json.dumps(g.response),
        'writeResult': w.writeToDynamo(g.response)
    }
    
class WriteToDynamo():
    """ Wrapper method to connect to and writeStatus
        specific data of via DynamoDB instance """
        
    def __init__(self):
        self.setTableName('ReturnedLeetPasswords')
        self.dynamodb = self.initDynamo()
            
    def returnTableName(self):
        return self.TableName
        
    def initDynamo(self):
        return boto3.client('dynamodb')
        
    def setTableName(self, name):
        self.TableName = name
        
    def writeToDynamo(self, password):
        try:
            self.dynamodb.put_item(TableName=self.returnTableName(), 
Item={'createdWord':{'S':password}})
            self.result = 'success'
        except:
            self.result = 'failure'
        
        return self.result

class APIResult:
    """ Wrapper method to retrieve password and
        format the response """
        
    def __init__(self):
        self.pw = GeneratePassword()
        
    def createPassword(self):
        self.finalPassword = self.pw.generateFullBlobString()
        
    def returnResponse(self):
        if self.finalPassword:
            self.status = 200
            self.response = self.finalPassword
        else:
            self.status = 500
            self.response = 'Error occured creating the password. Yell at your 
computer screen now to resolve.'

class GeneratePassword:
    """ To generate a full string password based on 
        the three types of lists to choose from """
        
    def __init__(self):
        self.firstBlob = self.generateFirstBlob()
        self.secondBlob = self.generateSecondBlob()
        self.thirdBlob = self.generateThirdBlob()
        
    def generateFirstBlob(self):
        return random.choice(self.returnBadWordsList())
        
    def generateSecondBlob(self):
        return random.choice(self.returnGoodWordsList())
        
    def generateThirdBlob(self):
        return random.choice(self.returnSpecialCharactersList())
        
    def generateFullBlobString(self):
        return (self.firstBlob+self.thirdBlob+self.secondBlob)
        
    def returnBadWordsList(self):
        return ['6r01n', 'bu77', '703j4m', 'b0063r', 'puk3', 'd0n6']
        
    def returnGoodWordsList(self):
        return ['7035', 'k1773n', 'pudd1n6', 'ch41r', 'c4r']
        
    def returnSpecialCharactersList(self):
        return ['>', '*', '$', '=', '_', '<', '&', '#', '%', '@', '!']
