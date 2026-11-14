import ast
from pathlib import Path
import unittest
from sitemap_xml import collect_sitemap_urls

NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'
def xml(kind, entries):
    child = 'sitemap' if kind == 'sitemapindex' else 'url'
    return f'<{kind} xmlns="{NS}">' + ''.join(f'<{child}><loc>{v}</loc></{child}>' for v in entries) + f'</{kind}>'

class SitemapCoreTests(unittest.TestCase):
    def test_six_locale_urls_preserve_order_and_duplicates(self):
        urls = [f'https://oiyo.net/{lang}/guide/' for lang in ['ko','en','ja','zh','fr','es']]
        self.assertEqual(collect_sitemap_urls('index',lambda _: xml('urlset', urls+urls[:1]),self.fail),urls+urls[:1])

    def test_recursive_cycle_and_repeated_child_are_loaded_once(self):
        documents={'a':xml('sitemapindex',['b','b','a']),'b':xml('sitemapindex',['c']),'c':xml('urlset',[' https://oiyo.net/ko/ '])}
        calls=[]
        def load(url):
            calls.append(url)
            return documents[url]
        self.assertEqual(collect_sitemap_urls('a',load,self.fail),['https://oiyo.net/ko/'])
        self.assertEqual(calls,['a','b','c'])

    def test_failed_child_reported_without_losing_healthy_sibling(self):
        errors=[]
        docs={'a':xml('sitemapindex',['bad','good']),'bad':'<invalid','good':xml('urlset',['ok'])}
        self.assertEqual(collect_sitemap_urls('a',docs.__getitem__,lambda u,e:errors.append(u)),['ok'])
        self.assertEqual(errors,['bad'])

    def test_loader_failure_is_reported(self):
        errors=[]
        def load(_): raise OSError('fixture unavailable')
        self.assertEqual(collect_sitemap_urls('a',load,lambda u,e:errors.append(type(e))),[])
        self.assertEqual(errors,[OSError])

    def test_empty_document_and_missing_loc(self):
        self.assertEqual(collect_sitemap_urls('a',lambda _:f'<urlset xmlns="{NS}"><url/></urlset>',self.fail),[])

    def test_adapter_keeps_local_loader_dist_and_warning(self):
        # WHY 2026-11-05: don't import the executable's credential loader in tests.
        tree=ast.parse(Path(__file__).with_name('sitemap-submit.py').read_text())
        fn=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='parse_sitemap')
        calls=[];warnings=[]
        scope={'Optional':__import__('typing').Optional,'Path':Path,'_load_sitemap_xml':lambda u,d:(calls.append((u,d)) or '<bad'),'log':lambda m,l:warnings.append((m,l))}
        exec(compile(ast.Module(body=[fn],type_ignores=[]),'adapter','exec'),scope)
        self.assertEqual(scope['parse_sitemap']('index',Path('/fixture')),[])
        self.assertEqual(calls,[('index',Path('/fixture'))])
        self.assertEqual(warnings[0][1],'WARN')

if __name__=='__main__':unittest.main()
