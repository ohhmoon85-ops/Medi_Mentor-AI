// PubMed E-utilities API 커넥터

const NCBI_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
const API_KEY = process.env.NCBI_API_KEY ?? ''

interface PubMedArticle {
  pmid: string
  title: string
  abstract: string
  year: number
  authors: string[]
  journal: string
}

export async function searchPubMed(query: string, maxResults = 20): Promise<PubMedArticle[]> {
  const searchUrl = new URL(`${NCBI_BASE}/esearch.fcgi`)
  searchUrl.searchParams.set('db', 'pubmed')
  searchUrl.searchParams.set('term', query)
  searchUrl.searchParams.set('retmax', String(maxResults))
  searchUrl.searchParams.set('retmode', 'json')
  searchUrl.searchParams.set('sort', 'relevance')
  if (API_KEY) searchUrl.searchParams.set('api_key', API_KEY)

  const searchRes = await fetch(searchUrl.toString())
  const searchData = await searchRes.json()
  const ids: string[] = searchData.esearchresult?.idlist ?? []

  if (ids.length === 0) return []

  const fetchUrl = new URL(`${NCBI_BASE}/efetch.fcgi`)
  fetchUrl.searchParams.set('db', 'pubmed')
  fetchUrl.searchParams.set('id', ids.join(','))
  fetchUrl.searchParams.set('retmode', 'json')
  fetchUrl.searchParams.set('rettype', 'abstract')
  if (API_KEY) fetchUrl.searchParams.set('api_key', API_KEY)

  const fetchRes = await fetch(fetchUrl.toString())
  const fetchData = await fetchRes.json()

  const articles: PubMedArticle[] = []
  const pubmedArticles = fetchData.PubmedArticleSet?.PubmedArticle ?? []

  for (const article of pubmedArticles) {
    const medline = article.MedlineCitation
    const pmid = String(medline?.PMID?._text ?? medline?.PMID ?? '')
    const title = medline?.Article?.ArticleTitle?._text ?? medline?.Article?.ArticleTitle ?? ''
    const abstractText =
      medline?.Article?.Abstract?.AbstractText?._text ??
      medline?.Article?.Abstract?.AbstractText ?? ''
    const year = parseInt(
      medline?.Article?.Journal?.JournalIssue?.PubDate?.Year ?? '0'
    )
    const journal = medline?.Article?.Journal?.Title ?? ''

    if (pmid && abstractText) {
      articles.push({ pmid, title, abstract: abstractText, year, authors: [], journal })
    }
  }

  return articles
}

export function buildPubMedUrl(pmid: string): string {
  return `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
}
