import type { FC } from 'react';
import type IconProps from './IconProps';

const Loader: FC<IconProps> = ({ color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 50 50"
    xmlSpace="preserve"
    color={color || '#FF7676'}
  >
    <path fill="currentColor" d="M10 10h4v10h-4z">
      <animateTransform
        attributeType="xml"
        attributeName="transform"
        type="translate"
        values="0 0; 0 25; 0 0"
        begin="0"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </path>
    <path fill="currentColor" d="M23 10h4v10h-4z">
      <animateTransform
        attributeType="xml"
        attributeName="transform"
        type="translate"
        values="0 0; 0 23; 0 0"
        begin="0.2s"
        dur="1s"
        repeatCount="indefinite"
      />
    </path>
    <path fill="currentColor" d="M36 10h4v10h-4z">
      <animateTransform
        attributeType="xml"
        attributeName="transform"
        type="translate"
        values="0 0; 0 25; 0 0"
        begin="0.4s"
        dur="1.2s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

export default Loader;
