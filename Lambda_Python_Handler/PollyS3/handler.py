import json, random, boto3, datetime, string, glob, urllib.request
from boto3 import Session
from boto3 import resource

# version 0.0.1

def lambda_handler(event, context):
    # build our data
    payload = json.loads(event['body'])
    password = payload['password']

    # create API result
    response = APIResult(type,length)
    
    d = Pollys3('x test')
    d.generateMP3()
    
    return {
        'isBase64Encoded': False,
        'statusCode': response.returnStatusCode(),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials' : True
        },
        'body': json.dumps(response.returnResponse())
    }
    
class APIResult:
    def __init__(self, type,length):
        self.validateType(type,length)
        
    def validateType(self, type,length):
        if (type == 'complex') or (type == 'leet'):
            #TODO
            self.status = 200
        else:
            self.status = 404
            self.response = 'API returns failure of some kind.'
        
    def returnStatusCode(self):
        return self.status
    
    def returnResponse(self):
        return self.response

class Pollys3:
    bucket_name = "cdn.audio.passwordington.com"
    
    def __init__(self, passwordString):
        self.password = passwordString
        self.s3Resource = s3 = resource('s3')
        
    def returnRandomVoiceID(self):
        list = ['Justin','Joey','Matthew','Salli','Kimberly','Kendra','Joanna','Ivy']
        return random.choice(list)
        
    def buildPasswordIntoSpacedString(self):
        return ''
        
    def returnFileName(self):
        filename = 'new_test'
        extension = '.mp3'
        fullFilename = filename + extension
        return fullFilename
        
    def generateMP3(self):
        session = Session(region_name="us-east-1")
        polly = session.client("polly")
        bucket = self.s3Resource.Bucket(self.bucket_name)
        filename = self.returnFileName()
        myText = self.password
    
        response = polly.synthesize_speech(
                        Text=myText,
                        OutputFormat="mp3",
                        VoiceId=self.returnRandomVoiceID())
        stream = response["AudioStream"]
        
        bucket.put_object(Key=filename, Body=stream.read())
