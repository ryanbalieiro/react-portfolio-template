/**
 * @author Ryan Balieiro
 * @date 2025-05-10
 * @description This class is a wrapper for the article data. It provides methods to parse and validate the data loaded from a section's JSON file.
 */

import ArticleItemDataWrapper from "/src/hooks/models/ArticleItemDataWrapper.js"
import {useUtils} from "/src/hooks/utils.js"

const utils = useUtils()

export default class ArticleDataWrapper {
    /** @const **/
    static CATEGORY_ALL = "category_all"

    /**
     * @param {Object} section
     * @param {Object} rawData
     * @param {Object} language
     * @param {Object} theme
     * @param {Number} id
     */
    constructor(section, rawData, language, theme, id) {
        this._items = this._parseItems(rawData, language, theme)
        this._section = section

        this.id = id
        this.component = rawData.component
        this.locales = this._parseLocales(rawData, language)
        this.settings = this._parseSettings(rawData)
        this.categories = this._parseCategories(rawData, language)

        this._evaluate()
    }

    /**
     * @param {Object} rawData
     * @param {Object} language
     * @private
     */
    _parseLocales(rawData, language) {
        const rawLocales = rawData.locales || {}

        return {
            contactThankYouTitle: language.getTranslation(rawLocales, "contact_thank_you_title", undefined),
            contactThankYouBody: language.getTranslation(rawLocales, "contact_thank_you_body", undefined),
            contactThankYouFooter: language.getTranslation(rawLocales, "contact_thank_you_footer", undefined),
            title: language.getTranslation(rawLocales, "title", null),
        }
    }

    /**
     * @param {Object} rawData
     * @private
     */
    _parseSettings(rawData) {
        const rawSettings = rawData.settings || {}

        return {
            // General Settings...
            orderItemsBy: rawSettings["order_items_by"] || "id",
            orderItemsSort: rawSettings["order_items_sort"] || "asc",

            // - ArticleInlineList
            displayAsListIfWidthIsLowerThan: rawSettings["display_as_list_if_width_is_lower_than"] || undefined,

            // - ArticleSkills
            maxItemsPerRow: rawSettings["max_items_per_row"] || undefined,
            maxRowsCollapseThreshold: rawSettings["max_rows_collapse_threshold"] || undefined,
            roundIcons: Boolean(rawSettings["round_icons"]) || undefined,

            // - ArticleContactForm
            emailJsPublicKey: rawSettings["email_js_public_key"] || undefined,
            emailJsServiceId: rawSettings["email_js_service_id"] || undefined,
            emailJsTemplateId: rawSettings["email_js_template_id"] || undefined,
        }
    }

    /**
     * @param rawData
     * @param language
     * @param theme
     * @return {ArticleItemDataWrapper[]}
     * @private
     */
    _parseItems(rawData, language, theme) {
        const rawItems = rawData.items || []
        return rawItems.map((rawItem, key) => {
            return new ArticleItemDataWrapper(this, rawItem, language, theme, key + 1)
        })
    }

    /**
     * @param rawData
     * @param language
     * @return {Array}
     * @private
     */
    _parseCategories(rawData, language) {
        const settings = rawData.settings || {}
        const categorizeBy = settings["categorize_by"]

        if(!categorizeBy || !Array.isArray(categorizeBy) || categorizeBy.length === 0)
            return []

        const categories = [{
            id: ArticleDataWrapper.CATEGORY_ALL,
            key: 0,
            all: true,
            label: language.getTranslation(rawData.locales, ArticleDataWrapper.CATEGORY_ALL),
            count: this.orderedItems.length
        }]

        categorizeBy.forEach(categoryId => {
            categories.push({
                id: categoryId,
                key: categories.length,
                all: false,
                label: language.getTranslation(rawData.locales, categoryId),
                count: this.getOrderedItemsFilteredBy(categoryId).length,
            })
        })

        this._items.forEach(item => {
            item.category = categories.find(category => category.id === item.categoryId)
        })

        return categories
    }

    get uniqueId() {
        return `article-${this.id}-section-${this._section?.id}`
    }

    get sectionId() {
        return this._section?.id
    }

    get orderedItems() {
        const { orderItemsBy, orderItemsSort } = this.settings
        return this._items.slice().sort((a, b) => {
            const aValue = a[orderItemsBy]
            const bValue = b[orderItemsBy]

            if (aValue < bValue) return orderItemsSort === "asc" ? -1 : 1
            if (aValue > bValue) return orderItemsSort === "asc" ? 1 : -1
            return 0
        })
    }

    getOrderedItemsFilteredBy(categoryId) {
        if(!categoryId || categoryId === "category_all")
            return this.orderedItems

        return this.orderedItems.filter(item => {
            return item.categoryId === categoryId
        })
    }

    getOrderedItemsFilteredByQuery(categoryId, query) {
        const base = this.getOrderedItemsFilteredBy(categoryId)
        if (!query || !query.trim()) return base

        const q = query.trim().toLowerCase()
        return base.filter(item => {
            const title = utils.string.stripHTMLTags(item.locales.title || "").toLowerCase()
            const text = utils.string.stripHTMLTags(item.locales.text || "").toLowerCase()
            const tags = (item.locales.tags || []).map(t => t.toLowerCase())
            return title.includes(q) || text.includes(q) || tags.some(tag => tag.includes(q))
        })
    }

    _evaluate() {
        // Check if all items have a valid categoryId...
        const categories = this.categories.map(category => category.id)
        this._items.forEach(item => {
            if(categories.length > 1 && !categories.includes(item.categoryId)) {
                utils.log.warn(
                    "ArticleDataWrapper",
                    `Item ${item.id} has an invalid categoryId "${item.categoryId}".`
                )
            }
        })
    }
}