FROM python:3.12-slim-buster

WORKDIR /usr/src/app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt gunicorn # Ensure gunicorn is installed

# Copy the function handler
COPY app.py .

# Expose port 3000 as required by Vercel for Docker runtime
EXPOSE 3000

# Command to run Gunicorn, serving the Flask app from 'app.py'
# Vercel provides the PORT environment variable, which Gunicorn will use.
CMD ["gunicorn", "--bind", "0.0.0.0:$PORT", "app:app"]