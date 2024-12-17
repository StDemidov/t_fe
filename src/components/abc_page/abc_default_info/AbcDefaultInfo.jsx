import { useState } from 'react';
import AbcInfo from './abc_info/AbcInfo';
import AbcForm from './abc_form/AbcForm';

const AbcDefaultInfo = ({ defaultData }) => {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <>
      {isEditing ? (
        <AbcForm defaultData={defaultData} setIsEditing={setIsEditing} />
      ) : (
        <AbcInfo defaultData={defaultData} setIsEditing={setIsEditing} />
      )}
    </>
  );
};

export default AbcDefaultInfo;
