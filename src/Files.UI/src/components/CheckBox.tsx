import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck as solidCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { faCircleCheck as hollowCircleCheck, faCircle } from '@fortawesome/free-regular-svg-icons'

export function CheckBox({ isChecked, className, onClick }) {
    const [isHovering, setIsHovering] = useState(false);

    const icon = isChecked
        ? solidCircleCheck
        : isHovering
            ? hollowCircleCheck
            : faCircle;

    return (
        <FontAwesomeIcon icon={icon}
            onMouseOver={() => setIsHovering(true)}
            onMouseOut={() => setIsHovering(false)}
            onClick={onClick}
        ></FontAwesomeIcon>
    )
}