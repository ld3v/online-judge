import { Input, InputProps } from 'antd';

interface IInputNumber extends Omit<InputProps, 'onChange'> {
  onChange?: (value: number) => void;
}

const InputNumber: React.FC<IInputNumber> = ({ onChange, ...inpProps }) => {
  const handleChange = (value: string | number) => {
    onChange?.(Number(value));
  };

  return (
    <Input type="number" onChange={({ target }) => handleChange(target.value)} {...inpProps} />
  );
};

export default InputNumber;
