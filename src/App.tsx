import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Divider, Form, Header, Icon } from 'semantic-ui-react';
import cogoToast from 'rb-cogo-toast';
import { convert } from 'tgs2lottie';

function App() {
  const [, update] = useState({});
  const fileRef = useRef<HTMLInputElement>(null);
  const sizeRef = useRef<HTMLInputElement>(null);

  const getFilename = (): string | undefined => {
    const paths = fileRef.current?.value.replace(/\\/g, '/').split('/');
    if (paths === undefined) return undefined;
    return paths[paths.length - 1].split('.').slice(0, -1).join('.');
  }

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
        }
        reader.onerror = (err) => {
          reject(err);
        }

        reader.readAsDataURL(file);
      }));

      const base64 = data.split(';base64,').slice(1).join(';base64,');
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const json = convert(bytes, size);

      const filename = getFilename();
      const element = document.createElement("a");
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
      if (fileRef.current != null) fileRef.current.value = "";
      update({});
    }
  }, [fileRef, sizeRef]);

  useEffect(() => { update({}) }, [fileRef]);

  return (
    <div className="app">
      <Card>
        <Card.Content>
          <Header as="h1">TGS2Lottie</Header>

          <Form onSubmit={(e) => e.preventDefault()}>
            <Form.Field>
              <label>Telegram Animated Sticker (.tgs):</label>
              <Button size="tiny" type="button" onClick={() => fileRef.current?.click()} positive>Select file</Button>
              {getFilename() ? `${getFilename()}.tgs` : 'Please select a file'}

              <input ref={fileRef} type="file" accept=".tgs" multiple={false} hidden={true} onChange={() => update({})} />
            </Form.Field>
            <Form.Field>
              <label>Size:</label>
              <input ref={sizeRef} type="number" min={1} max={Number.MAX_SAFE_INTEGER} defaultValue={512} />
            </Form.Field>
            <Button onClick={download} primary>Download</Button>
          </Form>

          <Card.Meta style={{ textAlign: 'right' }}>
            <Divider style={{ marginBottom: 8 }} />
            <a target="_blank" rel="noreferrer" href="https://npmjs.com/package/tgs2lottie">
              <Icon name="npm" /> npm
            </a>
            <span style={{ margin: '2px 6px 2px 4px', borderLeft: '1px solid rgba(255,255,255,0.3)' }} />
            <a target="_blank" rel="noreferrer" href="https://github.com/kamyu1537/tgs2lottie.git">
              <Icon name="github" /> Github
            </a>
          </Card.Meta>
        </Card.Content>
      </Card>
    </div>
  );
}

export default App;
