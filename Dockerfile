# Use an official Python runtime as a base image
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code into the container
COPY . .

# Expose the port the application runs on (default for Django is 8000)
EXPOSE 8000

# Set environment variables (adjust these as needed for Back4App)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Collect static files for production (adjust if not using Django)
RUN python manage.py collectstatic --noinput

# Run database migrations (if needed)
RUN python manage.py migrate --noinput

# Command to run the application (adjust if not using Django)
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "StudentMangementSys.wsgi:application"]
