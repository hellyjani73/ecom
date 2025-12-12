import React, { FC, useState } from 'react';
import { Avatar, IconButton, Popover } from '@mui/material';

import images from '../assets/images';
import { Regex } from '../utils/strings';
import { ValidationMessage } from '../utils/resource';
import { PasswordScores } from '../constants';

export type PasswordValidatorProps = {
  value: string;
  // eslint-disable-next-line react/require-default-props
  className?: string;
};

const PasswordStrengthBar: FC<PasswordValidatorProps> = ({ value, className }) => {
  const [anchorToolTipEl, setAnchorToolTipEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorToolTipEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorToolTipEl(null);
  };

  const checkPasswordScore = () => {
    let score = 0;
    if (value.length >= 10) {
      score += 20;
    }

    if (Regex.UpperCaseLettersRegex.test(value)) {
      score += 20;
    }
    if (Regex.SpecialCharacterRegex.test(value)) {
      score += 20;
    }
    if (Regex.LowerCaseLettersRegex.test(value)) {
      score += 20;
    }
    if (Regex.NumbersRegex.test(value)) {
      score += 20;
    }
    return score;
  };

  const strengthBarColor = () => {
    let color = '';
    if (checkPasswordScore() <= 20) {
      color = 'weak';
    } else if (checkPasswordScore() <= 80) {
      color = 'fair';
    } else {
      color = 'strong';
    }
    return color;
  };

  return (
    <div className={`password-verification ${className}`}>
      <div className="bar-wrapper">
        {PasswordScores.map((score) => {
          if (
            checkPasswordScore() > score ||
            checkPasswordScore() === PasswordScores[PasswordScores.length - 1]
          ) {
            return <span className={`bar ${strengthBarColor()}`} />;
          }
          return <span className="bar" />;
        })}
      </div>
      <IconButton
        className="ml-2"
        size="small"
        onClick={handleClick}
        sx={{ width: 20, height: 20 }}
      >
        <Avatar
          className="password-info"
          src={images.InfoGrey}
          alt="InfoGrey"
          variant="square"
          sx={{ width: 20, height: 20 }}
        />
      </IconButton>
      <Popover
        className="simple-tooltip"
        open={Boolean(anchorToolTipEl)}
        anchorEl={anchorToolTipEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <ul className="password-requirement">
          <li className={value.length >= 10 ? 'active' : ''}>
            {ValidationMessage.PasswordStrengthMinLength}
          </li>
          <li className={Regex.UpperCaseLettersRegex.test(value) ? 'active' : ''}>
            {ValidationMessage.PasswordStrengthUppercase}
          </li>
          <li className={Regex.LowerCaseLettersRegex.test(value) ? 'active' : ''}>
            {ValidationMessage.PasswordStrengthLowercase}
          </li>
          <li className={Regex.SpecialCharacterRegex.test(value) ? 'active' : ''}>
            {ValidationMessage.PasswordStrengthSpecialCharacter}
          </li>
          <li className={Regex.NumbersRegex.test(value) ? 'active' : ''}>
            {ValidationMessage.PasswordStrengthNumber}
          </li>
        </ul>
      </Popover>
    </div>
  );
};

export default PasswordStrengthBar;
