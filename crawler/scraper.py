"""The script scrapes the required data from the required projects
and sends this data to http://3.142.70.26:4001/parser/download-and-parse-file"""

import json
import os
from time import sleep

import requests
import rx
from rx import operators as ops


def organize_data(item):
    project = item.get("repository").get("html_url")
    fileUrl = item.get("html_url")
    sha = item.get("sha")
    language = item.get("name").split(".")[-1]
    data = {
        "project": project,
        "fileUrl": fileUrl,
        "fileHash": sha,
        "language": language,
    }
    return data


def http_send_data(item):
    url = "http://3.142.70.26:4001/parser/download-and-parse-file"
    headers = {"Content-Type": "application/json"}
    resp = requests.post(url, headers=headers, data=json.dumps(item))
    return resp.status_code, item


def main(key, q):
    if not key or not q:
        raise Exception("set environment variables")

    url = f"https://api.github.com/search/code?q={q}"
    headers = {"Authorization": f"Token {key}"}
    request_limit = True
    while request_limit:
        sleep(5)
        resp = requests.get(url, headers=headers)
        resp = resp.json()
        items = resp.get("items")
        if not items:
            request_limit = False
            sleep(60)
            main(key, q)
        source = rx.from_(items)
        rxpy = source.pipe(
            ops.map(lambda i: http_send_data(organize_data(i))),
        )
        rxpy.subscribe(
            on_next=lambda i: print("Got - {0}".format(i)),
            on_error=lambda e: print("Error : {0}".format(e)),
            on_completed=lambda: print("Job Done!"),
        )


if __name__ == "__main__":
    main(
        os.getenv("GITHUB_KEY") or "your_key",
        os.getenv("Q_STRING") or "awsaccess",
    )
