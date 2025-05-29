import React, { useState, useEffect } from 'react';
import { getAllSubCategories, getDetailCategoriesBySubId, mainCategories } from '../utils/categoryData';

const CategorySelector = ({ onCategorySelect }) => {
    const [selectedMainCategory, setSelectedMainCategory] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [selectedDetailCategory, setSelectedDetailCategory] = useState('');
    
    const [subCategories, setSubCategories] = useState([]);
    const [detailCategories, setDetailCategories] = useState([]);
    
    // 대분류가 변경되면 중분류 목록 업데이트
    useEffect(() => {
        if (selectedMainCategory) {
            const mainCategoryId = parseInt(selectedMainCategory);
            const filteredSubCategories = getAllSubCategories()
                .filter(sub => sub.mainCategoryId === mainCategoryId);
            
            setSubCategories(filteredSubCategories);
            setSelectedSubCategory('');
            setSelectedDetailCategory('');
            setDetailCategories([]);
        } else {
            setSubCategories([]);
            setSelectedSubCategory('');
            setSelectedDetailCategory('');
            setDetailCategories([]);
        }
    }, [selectedMainCategory]);
    
    // 중분류가 변경되면 소분류 목록 업데이트
    useEffect(() => {
        if (selectedSubCategory) {
            const subCategoryId = parseInt(selectedSubCategory);
            const filteredDetailCategories = getDetailCategoriesBySubId(subCategoryId);
            
            setDetailCategories(filteredDetailCategories);
            setSelectedDetailCategory('');
        } else {
            setDetailCategories([]);
            setSelectedDetailCategory('');
        }
    }, [selectedSubCategory]);
    
    // 소분류가 선택되면 상위 컴포넌트에 전달
    useEffect(() => {
        if (selectedDetailCategory) {
            const detailCategoryId = parseInt(selectedDetailCategory);
            
            // 선택된 카테고리 정보 찾기
            const mainCat = mainCategories.find(c => c.id === parseInt(selectedMainCategory));
            const subCat = subCategories.find(c => c.id === parseInt(selectedSubCategory));
            const detailCat = detailCategories.find(c => c.id === detailCategoryId);
            
            if (mainCat && subCat && detailCat) {
                onCategorySelect({
                    mainCategory: {
                        id: mainCat.id,
                        name: mainCat.name
                    },
                    subCategory: {
                        id: subCat.id,
                        name: subCat.name
                    },
                    detailCategory: {
                        id: detailCat.id,
                        name: detailCat.name
                    }
                });
            }
        }
    }, [selectedDetailCategory, selectedMainCategory, selectedSubCategory, subCategories, detailCategories, onCategorySelect]);
    
    const handleMainCategoryChange = (e) => {
        setSelectedMainCategory(e.target.value);
    };
    
    const handleSubCategoryChange = (e) => {
        setSelectedSubCategory(e.target.value);
    };
    
    const handleDetailCategoryChange = (e) => {
        setSelectedDetailCategory(e.target.value);
    };
    
    return (
        <div className="category-selector">
            <div className="selector-group">
                <label htmlFor="main-category">대분류</label>
                <select
                    id="main-category"
                    value={selectedMainCategory}
                    onChange={handleMainCategoryChange}
                >
                    <option value="">선택하세요</option>
                    {mainCategories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>
            
            <div className="selector-group">
                <label htmlFor="sub-category">중분류</label>
                <select
                    id="sub-category"
                    value={selectedSubCategory}
                    onChange={handleSubCategoryChange}
                    disabled={!selectedMainCategory}
                >
                    <option value="">선택하세요</option>
                    {subCategories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>
            
            <div className="selector-group">
                <label htmlFor="detail-category">소분류</label>
                <select
                    id="detail-category"
                    value={selectedDetailCategory}
                    onChange={handleDetailCategoryChange}
                    disabled={!selectedSubCategory}
                >
                    <option value="">선택하세요</option>
                    {detailCategories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default CategorySelector;
