import React, { useState, useEffect } from 'react';
import CatalogueListViewComponent from '@components/CatalogueListView.component';
import CatalogueGridViewComponent from '@components/CatalogueGridView.component';
import CatalogueResponsiveFilterComponent, { FilterTagWithGroup, FilterValues } from '@components/CatalogueResponsiveFilter.component';
import CatalogueItemDialogViewComponent from '@components/CatalogueItemDialogView.component';
import CatalogueItemModel from '@models/CatalogueItem.model';

import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';

import SearchIcon from '@material-ui/icons/Search';
import { makeStyles, createStyles, Theme, useTheme } from '@material-ui/core/styles';

import CatalogueItemRepository from '@repos/CatalogueItem.repository';

import sortByModes from '@constants/SortModes.constants'
import catalogueViewModes from '@constants/CatalogueViewModes.constants'
import { useMediaQuery } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        bottomGutter: {
            marginBottom: theme.spacing(2)
        },
        catalogueContainer: {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            padding: theme.spacing(2.5),
            maxWidth: '100vw'
        },
        overflow: {
            overflowY: 'scroll',
            overflowX: 'hidden'
        }
    }));

export default function CataloguePage() {
    const classes = useStyles();

    // States
    const [searchPhrase, setSearchPhrase] = useState('');
    const [filterValues, setFilterValues] = useState({
        catalogueViewMode: catalogueViewModes[0],
        sortByMode: sortByModes[0],
        selectedFilterTags: []
    } as FilterValues);
    const [showFilterAsFabFlag, setShowFilterAsFabFlag] = useState(false);
    const [catalogueItemDialogItem, setCatalogueItemDialogItem] = useState<CatalogueItemModel | null>(null);
    const [isCatalogueItemDialogOpen, setIsCatalogueItemDialogOpen] = useState(false);

    // Mutable block scope data
    let catalogueItems: Array<CatalogueItemModel> | null = null;

    // After effects
    useEffect(() => {
        let handleResize = () => {
            setShowFilterAsFabFlag(window.innerWidth < 850);
        }
        window.addEventListener('resize', handleResize);
        handleResize()
    }, []);


    // Handles
    const handleSearch = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSearchPhrase(event.target.value as string)
    }

    const handleCatalogueItemSelected = (item: CatalogueItemModel) => {
        setCatalogueItemDialogItem(item);
        setIsCatalogueItemDialogOpen(true);
    }

    const handleCatalogueItemViewClose = () => {
        setIsCatalogueItemDialogOpen(false);
    }

    const renderCatalogue = () => {
        // TODO: Implement cache refresh with timestamp
        if (catalogueItems == null) {
            catalogueItems = CatalogueItemRepository.getAllCatalogueItems();
        }

        let ventedCatalogueItems = filterAndSortCatalogue(catalogueItems as unknown as Array<CatalogueItemModel>);

        switch (filterValues.catalogueViewMode) {
            case catalogueViewModes[0]: { // Grid view
                return <CatalogueGridViewComponent onItemSelected={handleCatalogueItemSelected} items={ventedCatalogueItems} />;
            }
            case catalogueViewModes[1]: { // List View
                return <CatalogueListViewComponent onItemSelected={handleCatalogueItemSelected} items={ventedCatalogueItems} />;
            }
        }

        return null;
    }

    const filterAndSortCatalogue = (catalogue: Array<CatalogueItemModel>): Array<CatalogueItemModel> => {
        return sortCatalogue(filterCatalogue(catalogue));
    }

    const filterCatalogue = (catalogue: Array<CatalogueItemModel>): Array<CatalogueItemModel> => {
        let filteredCatalogue = new Array<CatalogueItemModel>();

        for (let item of catalogue) {
            let caseInsensitiveTitle = item.title.trim().toLocaleLowerCase();
            let caseInsensitiveSearch = searchPhrase.trim().toLocaleLowerCase();
            if (caseInsensitiveTitle.startsWith(caseInsensitiveSearch)) {
                // TODO: Optimize filter tags check
                if (filterValues.selectedFilterTags.every((tag: FilterTagWithGroup) => {
                    return item.filterTags.includes(tag.label);
                })) {
                    filteredCatalogue.push(item);
                }
            }
        }

        return filteredCatalogue;
    }

    // In place sort
    const sortCatalogue = (catalogue: Array<CatalogueItemModel>): Array<CatalogueItemModel> => {
        switch (filterValues.sortByMode) {
            case sortByModes[0]: { // Name
                catalogue.sort((a, b) => {
                    return a.title
                        .toLocaleLowerCase()
                        .localeCompare(b.title.toLocaleLowerCase())
                });
                break;
            }
            case sortByModes[1]: { // Newest to oldest
                catalogue.sort((a, b) => {
                    if (a.releaseDate === b.releaseDate) {
                        return b.title
                            .toLocaleLowerCase()
                            .localeCompare(a.title.toLocaleLowerCase());
                    } else if (a.releaseDate < b.releaseDate) {
                        return 1;
                    } else {
                        return -1;
                    }
                });
                break;
            }
            case sortByModes[2]: { // Oldest to newest
                catalogue.sort((a, b) => {
                    if (a.releaseDate === b.releaseDate) {
                        return a.title
                            .toLocaleLowerCase()
                            .localeCompare(b.title.toLocaleLowerCase());
                    } else if (a.releaseDate < b.releaseDate) {
                        return -1;
                    } else {
                        return 1;
                    }
                });
                break;
            }
        }

        return catalogue
    }

    return (
        <React.Fragment>
            <Box className={classes.catalogueContainer}>

                <Typography gutterBottom variant="h4">
                    <Box fontWeight='fontWeightBold'>App Catalogue</Box>
                </Typography>
                <Box className={classes.bottomGutter}>
                    <Grid
                        container
                        spacing={2}
                        justify="space-between">

                        {!showFilterAsFabFlag ?
                            (<CatalogueResponsiveFilterComponent
                                showFilterAsFabFlag={false}
                                filterValues={filterValues}
                                setFilterValues={setFilterValues} />)
                            : null}
                        <Grid item xs={showFilterAsFabFlag ? 12 : 3}>
                            <TextField
                                fullWidth
                                label="Search"
                                onChange={handleSearch}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <SearchIcon />
                                        </InputAdornment>)
                                }}
                            />
                        </Grid>
                    </Grid>
                </Box>
                <Box flexDirection="row" flexGrow={1} className={classes.overflow}>
                    {renderCatalogue()}
                </Box>
            </Box>
            {showFilterAsFabFlag ?
                (<CatalogueResponsiveFilterComponent
                    showFilterAsFabFlag
                    filterValues={filterValues}
                    setFilterValues={setFilterValues} />)
                : null}
            {catalogueItemDialogItem != null ? (<CatalogueItemDialogViewComponent
                isOpen={isCatalogueItemDialogOpen}
                catalogueItem={catalogueItemDialogItem}
                handleClose={handleCatalogueItemViewClose}
            />) : null}
        </React.Fragment>
    );
}

