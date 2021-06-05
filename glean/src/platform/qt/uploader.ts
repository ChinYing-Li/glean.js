/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { UploadResult } from "../../core/upload/uploader.js";
import type Uploader from "../../core/upload/uploader.js";
import { DEFAULT_UPLOAD_TIMEOUT_MS, UploadResultStatus } from "../../core/upload/uploader.js";

class QtUploader implements Uploader {
  async post(url: string, body: string, headers: Record<string, string> = {}): Promise<UploadResult> {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.timeout = DEFAULT_UPLOAD_TIMEOUT_MS;
      xhr.open("POST", url);

      for (const header in headers) {
        xhr.setRequestHeader(header, headers[header]);
      }

      xhr.ontimeout = function(e) {
        console.error("Timeout while attempting to upload ping.", e);
        resolve({
          result: UploadResultStatus.RecoverableFailure,
        });
      };

      xhr.onerror = function(e) {
        console.error("Network while attempting to upload ping.", e);
        resolve({
          result: UploadResultStatus.RecoverableFailure,
        });
      };

      xhr.onabort = function (e) {
        console.error("The attempt to upload ping is aborted.", e);
        resolve({
          result: UploadResultStatus.RecoverableFailure,
        });
      };

      xhr.onload = () => {
        resolve({
          status: xhr.status,
          result: UploadResultStatus.Success,
        });
      };

      xhr.send(body);
    });
  }
}

export default new QtUploader();
