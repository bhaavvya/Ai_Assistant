from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import requests
import dotenv
from dotenv import load_dotenv
import os
import groq


app = Flask(__name__)
CORS(app, resources={r"/search": {"origins": "https://ai-assistant-8c8dgrqjl-bhavyas-projects-609c9ecd.vercel.app"}})

def load_dotenv():
  """
  Loads environment variables from the .env file if it exists.
  """
  try:
    from dotenv import load_dotenv
    load_dotenv()
  except ModuleNotFoundError:
    print("Warning: dotenv library not found. Environment variables may not be loaded.")


# Replace with your SERPER and Groq API keys
load_dotenv()


SERPER_SEARCH_ENDPOINT = os.getenv("SERPER_SEARCH_ENDPOINT")
GROQ_ENDPOINT = os.getenv("GROQ_ENDPOINT")

@app.route('/')
def home():
    return "Welcome to the AI Assistant API"


@app.route('/search', methods=['POST'])
def search():
    data = request.json
    print(f"Received data: {data}")  # Log the incoming request

    query = data.get("query", "")
    if not query:
        return jsonify({"error": "No query provided"}), 400

    # Call the SERPER API to fetch results
    search_results = search_with_serper(query)
    print(f"Search results: {search_results}")  # Log search results

    # Call Groq API to generate a response based on the results
    if search_results:
        snippets = [item['snippet'] for item in search_results]
        answer = generate_answer(query, snippets)

        return jsonify({
            "results": search_results,
            "answer": answer
        })
    else:
        return jsonify({"error": "No results found"}), 404



def search_with_serper(query):
    payload = json.dumps({"q": query, "num": 5})
    headers = {"X-API-KEY": os.getenv("YOUR_SERPER_API_KEY"), "Content-Type": "application/json"}


    try:
        response = requests.post(SERPER_SEARCH_ENDPOINT, headers=headers, data=payload)
        print(f"SERPER response: {response.json()}")  # Log response
        if response.status_code != 200:
            return []
        return response.json().get('organic', [])[:5]  # return top 5 results
    except Exception as e:
        print(f"Error fetching SERPER results: {e}")
        return []



def generate_answer(query, snippets):
  """
  Generates an answer using the Groq API.

  Args:
      query (str): The question to be answered.
      snippets (list): A list of context snippets for the answer.

  Returns:
      str: The generated answer or an error message.
  """

  # Replace with your actual Groq API key

  # Groq client initialization
  client = groq.Client(api_key=os.getenv("YOUR_GROQ_API_KEY"))

  system_prompt = f"You are an AI assistant. Please answer the following question based on the provided contexts: {query}\n\n{''.join(snippets)}"

  try:
    # Use chat.completions.create for answer generation
    response = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": system_prompt
            }
        ],
        model="llama3-8b-8192"  # Replace with desired model (optional)
    )

    # Extract and return the answer
    return response.choices[0].message.content

  except groq.exceptions.APIError as e:
    print(f"Groq API Error: {e}")
    return "Error: Failed to generate response from Groq API."

  except Exception as e:
    print(f"Error generating answer: {e}")
    return "Error: An unexpected error occurred."


if __name__ == '__main__':
    app.run(debug=True)
