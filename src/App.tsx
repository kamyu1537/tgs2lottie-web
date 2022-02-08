import React, { useCallback, useEffect, useRef, useState } from 'react';
import cogoToast from 'rb-cogo-toast';
import { convert } from 'tgs2lottie';
import { ImGithub, ImNpm } from 'react-icons/im';

function App() {
  const [, update] = useState({});
  const fileRef = useRef<HTMLInputElement>(null);
  const sizeRef = useRef<HTMLInputElement>(null);

  const getFilename = (): string | undefined => {
    const paths = fileRef.current?.value.replace(/\\/g, '/').split('/');
    if (paths === undefined) return undefined;
    return paths[paths.length - 1].split('.').slice(0, -1).join('.');
  };

  const download = useCallback(async () => {
    if (fileRef.current?.files == null || fileRef.current?.files.length === 0) {
      cogoToast.error('please set the file');
      return;
    }

    const size = Number(sizeRef.current?.value);
    if (!Number.isInteger(size)) {
      cogoToast.error('size is not integer');
      return;
    }

    try {
      const file = fileRef.current?.files[0];
      const data: string = await (new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = (err) => {
          reject(err);
        };

        reader.readAsDataURL(file);
      }));

      const base64 = data.split(';base64,').slice(1).join(';base64,');
      const bytes = Uint8Array.from(window.atob(base64), (c) => c.charCodeAt(0));
      const json = convert(bytes, size);

      const filename = getFilename();
      const element = document.createElement('a');
      const blob = new Blob([json], { type: 'text/json' });
      element.href = URL.createObjectURL(blob);
      element.download = `${filename}_${size}.json`;
      document.body.appendChild(element);
      element.click();
      element.remove();
    } catch (e) {
      cogoToast.error('an error occurred during conversion!');
      console.error(e);
    } finally {
      if (fileRef.current != null) fileRef.current.value = '';
      update({});
    }
  }, [fileRef, sizeRef]);

  useEffect(() => {
    update({});
  }, [fileRef]);

  return (
    <div className="dark:bg-gray-900 rounded-lg shadow-2xl px-7 py-2">
      <h1 className="text-center text-3xl my-4">TGS2Lottie</h1>

      <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block">Telegram Animated Sticker (.tgs):</label>
          <button type="button" onClick={() => fileRef.current?.click()}>
            Select file
          </button>

          <span className="ml-3 text-sm">
            {getFilename() ? `${getFilename()}.tgs` : 'Please select a file'}
          </span>
        </div>

        <div>
          <input ref={fileRef} type="file" accept=".tgs" multiple={false} hidden={true} onChange={() => update({})} />
        </div>

        <div>
          <label>Size:</label>
          <input ref={sizeRef} type="number" min={1} max={Number.MAX_SAFE_INTEGER} defaultValue={512} />
        </div>

        <button type="submit" onClick={download}>Download</button>
      </form>

      <div className="mt-7 w-full pt-1.5 border-t">
        <a target="_blank" rel="noreferrer" className="float-right" href="https://npmjs.com/package/tgs2lottie">
          <ImNpm className="inline" /> npm
        </a>
        <a target="_blank" rel="noreferrer" className="float-right" href="https://github.com/kamyu1537/tgs2lottie.git">
          <ImGithub className="inline" /> Github
        </a>
      </div>
    </div>
  );
}

export default App;
