import { useContext } from 'react';
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict'
import subMonths from 'date-fns/subMonths'
import isAfter from 'date-fns/isAfter'
import formatISO from 'date-fns/formatISO'
import { LocaleContext } from './LocaleContext';
import { sv } from 'date-fns/locale'
import { useTranslation } from "react-i18next";

export function useDateFormat() {
    const { locale } = useContext(LocaleContext);
    const { t } = useTranslation();

    const lastMonth = subMonths(new Date(), 1);

    return function (dateString) {
        const date = new Date(dateString);

        if (isAfter(date, lastMonth)) {
            const formattedDate = formatDistanceToNowStrict(
                date, { locale: locale === "sv" ? sv : undefined }
            );

            return `${formattedDate} ${t("ago")}`;
        } else {
            return formatISO(date, { representation: 'date' });
        }
    }
}