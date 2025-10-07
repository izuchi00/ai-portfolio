FROM python:3.12-slim-buster

WORKDIR /usr/src/app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the function handler
COPY python-analysis.py .

# Expose port 3000 as required by Vercel for Docker runtime
EXPOSE 3000

# Command to run Gunicorn, serving the Flask app from 'python-analysis.py'
CMD ["gunicorn", "--bind", "0.0.0.0:3000", "python-analysis:app"]