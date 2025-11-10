const presetQueries = {
  lexical: {
    label: "All Lexical Entries",
    query: `PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX lexinfo: <http://www.lexinfo.net/ontology/2.0/lexinfo#>

#
# This query extracts the lemmas and definitions for all of the South Asian languages so far included
#

SELECT DISTINCT ?lang (GROUP_CONCAT(STR(?lemma); SEPARATOR=" / ") AS ?combinedForm) ?defn ?et WHERE {

  {
    GRAPH <https://lari-datasets.ilc.cnr.it/chamuca_hi_lex> {
      ?lex a ontolex:LexicalEntry ;
           ontolex:canonicalForm ?form ;
           ontolex:sense/skos:definition ?defn ;
           lexinfo:etymology ?et .
      ?form ontolex:writtenRep ?lemma .
      FILTER(LANG(?lemma) IN ("hi-Deva", "hi-Latn"))
    }
    BIND("hi" AS ?lang)
  }

  UNION

  {
    GRAPH <https://lari-datasets.ilc.cnr.it/chamuca_ur_lex> {
      ?lex a ontolex:LexicalEntry ;
           ontolex:canonicalForm ?form ;
           ontolex:sense/skos:definition ?defn ;
           lexinfo:etymology ?et .
      ?form ontolex:writtenRep ?lemma .
      FILTER(LANG(?lemma) IN ("ur-Arab", "ur-Latn"))
    }
    BIND("ur" AS ?lang)
  }

  UNION

  {
    GRAPH <https://lari-datasets.ilc.cnr.it/chamuca_pa_lex> {
      ?lex a ontolex:LexicalEntry ;
           ontolex:canonicalForm ?form ;
           ontolex:sense/skos:definition ?defn ;
           lexinfo:etymology ?et .
      ?form ontolex:writtenRep ?lemma .
      FILTER(LANG(?lemma) IN ("pa-In", "pa-Ltn", "pnb"))
    }
    BIND("pa" AS ?lang)
  }

}
GROUP BY ?lex ?lang ?defn ?et
ORDER BY ?lang ?combinedForm
    `,
  },

  hindi: {
    label: "Senses + Definitions",
    query: `PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
PREFIX lexinfo: <http://www.lexinfo.net/ontology/2.0/lexinfo#>

#
# This query compares the Hindi gender with Portuguese gender
#

SELECT ?hindiWordConcat ?hgen ?portugueseWord ?pgen WHERE {

  # Subquery to concatenate Devanagari + Latin forms
  {
    SELECT ?hEntry (GROUP_CONCAT(STR(?hindiWord); SEPARATOR=" / ") AS ?hindiWordConcat) WHERE {
      GRAPH <https://lari-datasets.ilc.cnr.it/chamuca_hi_lex> {
        ?hEntry ontolex:canonicalForm/ontolex:writtenRep ?hindiWord .
      }
    }
    GROUP BY ?hEntry
  }

  # Get gender and Portuguese link from Hindi lexicon
  GRAPH <https://lari-datasets.ilc.cnr.it/chamuca_hi_lex> {
    ?hEntry a ontolex:LexicalEntry ;
            lexinfo:etymologicalRoot ?ptID ;
            lexinfo:gender ?hgen .
  }

  # Get canonical form and gender from Portuguese lexicon
  GRAPH <https://lari-datasets.ilc.cnr.it/chamuca_pt_lex> {
    ?ptID ontolex:canonicalForm/ontolex:writtenRep ?portugueseWord ;
          lexinfo:gender ?pgen .
  }
}
    `,
  },

  etymons: {
    label: "Portuguese Etymons",
    query: `PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
PREFIX lexinfo: <http://www.lexinfo.net/ontology/2.0/lexinfo#>

#
# This query returns a list of Portuguese etymons and their reflexes
#

SELECT ?portugueseWord (SAMPLE(?hindiWord) AS ?hi) (SAMPLE(?urduWord) AS ?ur) (SAMPLE(?punjabiWord) AS ?pa) WHERE {

  # Portuguese entry and its written form
  GRAPH <https://lari-datasets.ilc.cnr.it/chamuca_pt_lex> {
    ?ptEntry a ontolex:LexicalEntry ;
             ontolex:canonicalForm/ontolex:writtenRep ?portugueseWord .
  }

  # Hindi borrowing
  OPTIONAL {
    GRAPH <https://lari-datasets.ilc.cnr.it/chamuca_hi_lex> {
      ?hiEntry a ontolex:LexicalEntry ;
               lexinfo:etymologicalRoot ?ptEntry ;
               ontolex:canonicalForm/ontolex:writtenRep ?hindiWord .
    }
  }

  # Urdu borrowing
  OPTIONAL {
    GRAPH <https://lari-datasets.ilc.cnr.it/chamuca_ur_lex> {
      ?urEntry a ontolex:LexicalEntry ;
               lexinfo:etymologicalRoot ?ptEntry ;
               ontolex:canonicalForm/ontolex:writtenRep ?urduWord .
    }
  }

  # Punjabi borrowing
  OPTIONAL {
    GRAPH <https://lari-datasets.ilc.cnr.it/chamuca_pa_lex> {
      ?paEntry a ontolex:LexicalEntry ;
               lexinfo:etymologicalRoot ?ptEntry ;
               ontolex:canonicalForm/ontolex:writtenRep ?punjabiWord .
    }
  }
}
GROUP BY ?portugueseWord
ORDER BY ?portugueseWord
    `,
  },
}
