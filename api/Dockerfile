FROM python:3.12-slim-buster

WORKDIR /usr/src/app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the function handler
COPY python-analysis.py .

CMD ["python", "python-analysis.py"]