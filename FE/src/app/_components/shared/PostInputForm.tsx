'use client'

import { categories, FORM_INSERT_API_URL, Platforms, SERVER_BASE_URL } from '@/services/common/constants';
import { Category, Platfrom } from '@/services/common/types';
import { Plus, Link2, Hash, Sparkles, Filter, Search, X } from 'lucide-react';
import { utility } from '@/services/common/utils'
import Image from 'next/image';
import React, { ChangeEvent, useState } from 'react';

type UrlValidation = {
  isValid: boolean | null,
  platform: any | null;
} 

export interface FormDataType {
    url: string[],
    category: string,
    customTags: string[],
    fetchSimilar: boolean,
    similarityLevel: string,
    contentType: string
}

export const PostInputForm:React.FC = () => {

  const [formData, setFormData] = useState<FormDataType>({
    url: [],
    category: '',
    customTags: [],
    fetchSimilar: true,
    similarityLevel: 'medium',
    contentType: 'auto'
  });
  const [newTag, setNewTag] = useState<string>('');
  const [newUrl, setNewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlValidation, setUrlValidation] = useState<UrlValidation>({ isValid: null, platform: null });

  const platformIconsObj: Record<string, string> = {};
  Platforms().forEach((platform: Platfrom) => {
    platformIconsObj[platform.name] = `${platform.icon}.svg`;
  });


  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    let url = e.target.value.trim();
    validateUrl(url);
    setNewUrl(url);
  };

  const validateUrl = (url: string) => {
    if (!url) {
      setUrlValidation({ isValid: null, platform: null });
      return;
    }

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/;
    const redditRegex = /^(https?:\/\/)?(www\.)?reddit\.com/;
    
    if (youtubeRegex.test(url)) {
      setUrlValidation({ isValid: true, platform: 'youtube' });
    } else if (redditRegex.test(url)) {
      setUrlValidation({ isValid: true, platform: 'reddit' });
    } else if (url.startsWith('http')) {
      setUrlValidation({ isValid: true, platform: 'other' });
    } else {
      setUrlValidation({ isValid: false, platform: null });
    }

  };

  const addTag = () => {
    if (newTag && !formData.customTags.includes(newTag)) {
      setFormData({
        ...formData,
        customTags: [...formData.customTags, newTag]
      });
      setNewTag('');
    }
  };

  const handleTagInput = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value && !value.startsWith('#')) {
      value = `#${value}`;
    }
    setNewTag(value);
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      customTags: formData.customTags.filter(tag => tag !== tagToRemove)
    });
  };

  const removeUrl = (urlToRemove: string) => {
    setFormData({
      ...formData,
      url: formData.url.filter(url => url !== urlToRemove)
    });
  };

  const addUrl = () => {
    if (newUrl && !formData.url.includes(newUrl)) {
      setFormData({
        ...formData,
        url: [...formData.url, newUrl]
      });
      setNewUrl('');
    }
  }

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log('[PostInputForm] Starting submission with data:', formData);

    const options = { 
      method: 'POST', 
      body: JSON.stringify(formData),
      headers: { 
        'Content-Type': 'application/json',  
      },
    }
    
    try{
      console.log('[PostInputForm] Calling API:', FORM_INSERT_API_URL);
      const response = await utility.apicaller(FORM_INSERT_API_URL, options);
      console.log('[PostInputForm] Response status:', response.status);
      
      const responseData = await response.json();
      console.log('[PostInputForm] Response data:', responseData);
      
      const { body, status, length } = responseData;
      
      if(status === 200) {
        console.log('[PostInputForm] Successfully processed videos:', length);
        alert(`Content submitted successfully! ${length} videos processed.`);
        
        // Reset form
        setFormData({
          url: [],
          category: '',
          customTags: [],
          fetchSimilar: true,
          similarityLevel: 'medium',
          contentType: 'auto'
        });
        
        // Redirect to homepage
        console.log('[PostInputForm] Redirecting to homepage...');
        window.location.href = '/';
      } else {
        console.error('[PostInputForm] Non-200 status:', status);
        alert(`Error: ${responseData.message || 'Failed to process videos'}`);
      }
    } catch(error){
      console.error('[PostInputForm] Error submitting form:', error);
      alert('Failed to submit content. Please check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-golden to-dark-golden rounded-xl">
              <Plus className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-3xl font-bold text-gray-400">Add Post</h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Submit URLs from YouTube, Reddit, and other platforms to curate content for your feed. 
            Our AI will find similar posts and categorize them automatically.
          </p>
        </div>

        <div className="space-y-8">

          {/* URL Input Section */}
          <div className="bg-darker rounded-2xl p-6 border border-gray-800 shadow-md shadow-golden">
            <div className="flex items-center gap-3 mb-4">
              <Link2 className="w-5 h-5 text-golden" />
              <h2 className="text-xl font-semibold text-white">Content URL<sup className='text-golden text-xl mt-1'>*</sup></h2>
              <span className='text-medium text-red-500'> (maximum 5 Urls)</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex relative gap-2">
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => handleUrlChange(e)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
                  placeholder="Paste your YouTube, Reddit, or any content URL here..."
                  className="w-full bg-[#484848] bg-opacity-50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-golden focus:outline-none focus:ring-2 focus:ring-yellow-400/20 pr-12"
                />
                <div className="absolute right-20 top-1/2 transform -translate-y-1/2">
                  {urlValidation.isValid === false && <X onClick={() => (setNewUrl(''))} className="w-5 h-5 text-red-500" />}
                </div>
                <button
                  type="button"
                  disabled={formData.url.length > 5 || urlValidation.isValid === false}
                  onClick={addUrl}
                  className="px-4 py-2 bg-golden text-black rounded-large hover:bg-dark-golden transition-colors font-medium"
                >
                  Add
                </button>
              </div>
              
              {urlValidation.isValid === false && newUrl ? (
                <p className="text-red-400 text-sm">Please enter a valid URL starting with http:// or https://</p>
              ) : formData.url.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.url.map((url, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-700 text-white rounded-full text-sm"
                    >
                      {url}
                      <button
                        type="button"
                        onClick={() => removeUrl(url)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category Selection */}
          <div className="bg-darker bg-opacity-40 rounded-2xl p-6 border border-gray-800 shadow-md shadow-golden">
            <div className="flex items-center gap-3 mb-4">
              <Hash className="w-5 h-5 text-golden" />
              <h2 className="text-xl font-semibold text-white">Category</h2>
              <span className="text-sm text-gray-400">(Optional)</span>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
              {categories().map((category:Category) => (
                <button
                  key={category.title}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: category.title })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.category === category.title
                      ? 'border-dark-golden bg-yellow-500/10'
                      : 'border-gray-800 hover:border-[#484848] bg-[#484848] bg-opacity-50'
                  } flex justify-items-center items-center`}
                >
                  <Image 
                    className="text-2xl mb-2 object-contain opacity-10"
                    src={`${SERVER_BASE_URL}/${category.icon}.svg`}
                    width={100}
                    height={100}
                    alt={category.title}
                  />
                  <div className="text-dark-golden font-medium text-sm">{category.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Tags */}
          <div className="bg-darker rounded-2xl p-6 border border-gray-800 shadow-md shadow-golden">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-golden" />
              <h2 className="text-xl font-semibold text-white">Custom Tags</h2>
              <span className="text-sm text-red-500">(Add your favorite topics as tags to see related content)</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => handleTagInput(e)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a custom tag..."
                  className="flex-1 bg-[#484848] opacity-50 border border-gray-800 rounded-large px-3 py-2 text-white placeholder-gray-400 focus:border-golden focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-golden text-black rounded-large hover:bg-dark-golden transition-colors font-medium"
                >
                  Add
                </button>
              </div>
              
              {formData.customTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.customTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-700 text-white rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Features */}
          <div className="bg-darker rounded-2xl p-6 border border-gray-800 shadow-md shadow-golden">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-golden" />
              <h2 className="text-xl font-semibold text-white">AI Features</h2>
            </div>
            
            <div className="space-y-6">

              {/* Fetch Similar Content */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Find Similar Content</h3>
                  <p className="text-gray-400 text-sm">Automatically discover related posts and videos</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, fetchSimilar: !formData.fetchSimilar })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.fetchSimilar ? 'bg-dark-golden' : 'bg-golden'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
                      formData.fetchSimilar ? 'translate-x-6 bg-darker' : 'translate-x-1 bg-white'
                    }`}
                  />
                </button>
              </div>

              {/* Similarity Level */}
              {formData.fetchSimilar && (
                <div>
                  <h3 className="text-white font-medium mb-3">Similarity Level</h3>
                  <div className="flex gap-3">
                    {['low', 'medium', 'high'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({ ...formData, similarityLevel: level })}
                        className={`px-4 py-2 rounded-large font-medium transition-colors ${
                          formData.similarityLevel === level
                            ? 'bg-dark-golden text-black'
                            : 'bg-dark text-gray-300 hover:bg-[#484848]'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSubmit}
              disabled={!formData.url || urlValidation.isValid !== true || isSubmitting}
              className="px-8 py-4 bg-golden text-black font-bold rounded-xl hover:bg-dark-golden transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3 text-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Submit & Find Content
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};