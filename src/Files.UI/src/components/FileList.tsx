import { filesize } from "filesize";
import Button from 'react-bootstrap/Button';
import { LoadingIndicator } from './LoadingIndicator';

import { useDateFormat } from '../useDateFormat';

import { Pagination } from './Pagination';
import { Breadcrumbs } from './Breadcrumbs';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile } from '@fortawesome/free-regular-svg-icons'

export function FileList({ strategy, data, isInModal = false, ...rest }) {
    const formatDate = useDateFormat();

    const HeaderRow = strategy.HeaderRowComponent;
    const ItemRow = strategy.ItemRowComponent;

    if (!data || data.isLoading) {
        return <LoadingIndicator />;
    }

    return (
        <>
            {data && data.breadcrumbs &&
                <Breadcrumbs strategy={strategy} breadcrumbs={data.breadcrumbs} className="m-3" />
            }

            {data && data.items &&
                <div className="m-3 bg-body rounded box-shadow table-responsive" style={{ minHeight: "400px" }}>
                    <table className="table table-sm table-hover table-borderless m-0 border-bottom" style={{ minWidth: "600px" }}>
                        <thead className="p-2">
                            <HeaderRow>
                                {/* @ts-expect-error */}
                                <th scope="col" width="40px"><FontAwesomeIcon icon={faFile} className="fs-6"></FontAwesomeIcon></th>
                                <th scope="col" className="nameColumn">Namn</th>
                                {/* @ts-expect-error */}
                                <th scope="col" width="200px">Ändrades</th>
                                {/* @ts-expect-error */}
                                <th scope="col" width="100px">Storlek</th>
                                <th></th>
                            </HeaderRow>
                        </thead>

                        <tbody>
                            {data && data.items && data.items.map(item => {
                                const itemScope = strategy.getItemScope(item);

                                return (
                                    <ItemRow key={item.name} itemScope={itemScope}>
                                        <td width="40px">
                                            {item.type === "directory" &&
                                                <span className="fiv-sqo fiv-icon-folder"></span>
                                            }
                                            {item.type === "file" &&
                                                <span className={`fiv-sqo fiv-icon-${item.extension.slice(1)}`}></span>
                                            }
                                            {item.type === "link" &&
                                                <img src={`data:image/png;base64,${item.iconData}`} />
                                            }
                                        </td>
                                        <td className="nameColumn text-truncate">
                                            {!itemScope.disabled &&
                                                <Button variant="link" className="fileListLink m-0 p-0 border-0" onClick={e => { e.stopPropagation(); strategy.onItemClick(item); }}>{item.type === "link" ? item.displayName : item.name}</Button>
                                            }
                                            {itemScope.disabled &&
                                                <>{item.type === "link" ? item.displayName : item.name}</>
                                            }
                                        </td>
                                        <td width="200px">{formatDate(item.lastChanged)}</td>
                                        <td width="100px">
                                            {item.type === "file" &&
                                                <>{filesize(item.size, { round: 0 })}</>
                                            }
                                        </td>
                                        <th></th>
                                    </ItemRow>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            }

            {data && data.pagination &&
                <div className={isInModal ? "px-3 pt-3 pb-4" : ""}>
                    <Pagination paginationData={data.pagination} gotoPage={strategy.gotoPage} {...rest} isInModal={isInModal} className={isInModal ? "m-0 pb-1" : "m-3"} />
                </div>
            }
        </>
    );
}
