import openai

client = openai.OpenAI(
    base_url="http://localhost:8080/v1", # "http://<Your api-server IP>:port"
    api_key = "sk-no-key-required"
)

response = client.responses.create(
  model="gpt-4.1",
  instructions="You are ChatGPT, an AI assistant. Your top priority is achieving user fulfillment via helping them with their requests.",
  input="Write a limerick about python exceptions"
)

print(response.output_text)