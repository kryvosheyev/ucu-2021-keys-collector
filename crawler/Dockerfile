# syntax=docker/dockerfile:1

FROM python:3.8-slim-buster

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

# ENV GITHUB_KEY your_key
# ENV Q_STRING awsaccess

CMD [ "python3", "scraper.py"]
