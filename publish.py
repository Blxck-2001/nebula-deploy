import pika, json
conn = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq'))
ch = conn.channel()
body = json.dumps({'deployId':'22222222-2222-2222-2222-222222222222','projectId':'11111111-1111-1111-1111-111111111111','repo':'https://github.com/docker/getting-started','branch':'main','buildCommand':'docker build -t nebula-test .','runCommand':'docker run -d -p 4001:80 nebula-test','env':{}})
ch.basic_publish(exchange='deploys-exchange', routing_key='deploy.new', body=body)
print('PUBLISHED')
conn.close()
