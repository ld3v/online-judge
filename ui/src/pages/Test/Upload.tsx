import { InputUpload, LabelWithDesc } from '@/components/CardWrapForm/Input';
import { uploadMulti } from '@/services/file';
import { getOriginFiles } from '@/utils/funcs';
import { Button, Form } from 'antd';
import { useState } from 'react';

const TestUploadPage: React.FC = () => {
  const [uploading, setUploading] = useState<boolean>(false);

  const handleUpload = async ({ test }: any) => {
    setUploading(true);
    try {
      const files = getOriginFiles(test);
      await uploadMulti(files);
    } catch (err) {
      console.error('Something went wrong when try to test upload file:\n', err);
    }
    setUploading(false);
  };
  const TestLabel = (
    <LabelWithDesc label="Test upload" description="Chọn tệp hoặc thư mục cần tải lên" />
  );
  return (
    <>
      {uploading && <div>Uploading...</div>}
      <Form onFinish={handleUpload} layout="vertical">
        <Form.Item
          name="test"
          label={TestLabel}
          rules={[{ required: true, message: 'Please select your upload item!' }]}
        >
          <InputUpload directory />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    </>
  );
};

export default TestUploadPage;
