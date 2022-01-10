import json
import os
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
    url = f"https://api.github.com/search/code?q={q}"
    headers = {"Authorization": f"Token {key}"}
    resp = requests.get(url, headers=headers)
    resp = resp.json()
    items = resp["items"]
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
    main(os.getenv('GITHUB_KEY'), "awsaccess")
